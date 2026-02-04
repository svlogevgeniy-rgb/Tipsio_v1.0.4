import { decrypt, encrypt, isEncrypted } from "./encryption";

const MIDTRANS_SANDBOX_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";
const MIDTRANS_PRODUCTION_URL = "https://app.midtrans.com/snap/v1/transactions";
const MIDTRANS_API_BASE = {
  sandbox: "https://api.sandbox.midtrans.com",
  production: "https://api.midtrans.com",
} as const;

/**
 * Encrypt a Midtrans key for secure storage
 */
export function encryptKey(key: string): string {
  return encrypt(key);
}

export type MidtransEnvironment = "sandbox" | "production";

interface MidtransCredentials {
  serverKey: string;
  clientKey: string;
  merchantId: string;
  environment: MidtransEnvironment;
}

interface CreateTransactionParams {
  orderId: string;
  amount: number;
  customerDetails?: {
    firstName?: string;
    email?: string;
    phone?: string;
  };
  itemDetails?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  callbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  };
  enabledPayments?: string[];
}

interface SnapResponse {
  token: string;
  redirect_url: string;
}

/**
 * Get decrypted Midtrans credentials for a venue
 */
export function getDecryptedCredentials(venue: {
  midtransServerKey: string | null;
  midtransClientKey: string | null;
  midtransMerchantId: string | null;
  midtransEnvironment: string;
}): MidtransCredentials | null {
  if (!venue.midtransServerKey || !venue.midtransClientKey || !venue.midtransMerchantId) {
    return null;
  }

  return {
    serverKey: decrypt(venue.midtransServerKey),
    clientKey: isEncrypted(venue.midtransClientKey)
      ? decrypt(venue.midtransClientKey)
      : venue.midtransClientKey,
    merchantId: venue.midtransMerchantId,
    environment: venue.midtransEnvironment as MidtransEnvironment,
  };
}

/**
 * Create a Snap transaction with Midtrans
 */
export async function createSnapTransaction(
  credentials: MidtransCredentials,
  params: CreateTransactionParams
): Promise<SnapResponse> {
  const baseUrl =
    credentials.environment === "production"
      ? MIDTRANS_PRODUCTION_URL
      : MIDTRANS_SANDBOX_URL;

  const authString = Buffer.from(`${credentials.serverKey}:`).toString("base64");

  // Default payment methods including Google Pay
  const defaultPayments = [
    "credit_card",
    "google_pay",
    "gopay",
    "shopeepay",
    "qris",
    "bca_va",
    "bni_va",
    "bri_va",
    "permata_va",
    "other_va",
    "indomaret",
    "alfamart",
  ];

  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    credit_card: {
      secure: true, // Enable 3D Secure for credit card and Google Pay
    },
    enabled_payments: params.enabledPayments || defaultPayments,
    customer_details: params.customerDetails,
    item_details: params.itemDetails || [
      {
        id: "tip",
        name: "Digital Tip",
        price: params.amount,
        quantity: 1,
      },
    ],
    callbacks: params.callbacks,
  };

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Midtrans error:", error);
    throw new Error(error.error_messages?.[0] || "Failed to create transaction");
  }

  return response.json();
}

function inferEnvironmentFromKey(key: string | undefined): MidtransEnvironment | null {
  if (!key) return null;
  // SB- prefix is clearly sandbox
  if (key.startsWith("SB-")) return "sandbox";
  // Mid-server- and Mid-client- can be either sandbox or production
  // We cannot reliably determine environment from these prefixes alone
  // Return null to try both environments
  if (key.startsWith("Mid-")) return null;
  return null;
}

async function testServerKey(
  serverKey: string,
  environment: MidtransEnvironment
): Promise<{ ok: boolean; status: number }>
{
  const auth = Buffer.from(`${serverKey}:`).toString("base64");
  const orderId = `TIPSIO-VALIDATION-${Date.now()}`;
  const response = await fetch(`${MIDTRANS_API_BASE[environment]}/v2/${orderId}/status`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  // 401 indicates invalid server key
  if (response.status === 401) {
    return { ok: false, status: response.status };
  }

  // 404 = valid key but order not found; 200 = order exists
  if (response.status === 404 || response.status === 200) {
    return { ok: true, status: response.status };
  }

  return { ok: false, status: response.status };
}

export async function validateMidtransCredentials(options: {
  serverKey: string;
  clientKey: string;
  merchantId?: string;
  requireMerchantId?: boolean;
}): Promise<{ valid: boolean; environment?: MidtransEnvironment; message?: string }> {
  const { serverKey, clientKey, merchantId, requireMerchantId } = options;

  if (!serverKey || !clientKey || (requireMerchantId && !merchantId)) {
    return { valid: false, message: "All Midtrans credentials are required" };
  }

  const serverEnv = inferEnvironmentFromKey(serverKey);
  const clientEnv = inferEnvironmentFromKey(clientKey);

  if (serverEnv && clientEnv && serverEnv !== clientEnv) {
    return {
      valid: false,
      message: "Server Key and Client Key are from different environments",
    };
  }

  const candidateEnvs: MidtransEnvironment[] = serverEnv
    ? [serverEnv]
    : clientEnv
      ? [clientEnv]
      : ["sandbox", "production"]; // Try sandbox first as it's more common for testing

  for (const env of candidateEnvs) {
    const result = await testServerKey(serverKey, env);
    if (result.ok) {
      return { valid: true, environment: env };
    }

    // If auth failed, try the other environment (when applicable)
    if (result.status !== 401) {
      return {
        valid: false,
        message: "Failed to validate Midtrans credentials",
      };
    }
  }

  return { valid: false, message: "Invalid Midtrans credentials" };
}

/**
 * Verify Midtrans webhook signature
 */
export function verifyWebhookSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  
  return hash === signatureKey;
}

/**
 * Generate unique order ID for tips
 */
export function generateTipOrderId(venueId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TIP-${venueId.substring(0, 8)}-${timestamp}-${random}`;
}
