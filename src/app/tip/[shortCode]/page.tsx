"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Loader2, User, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslations } from "@/i18n/client";

interface Staff {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  status?: string;
}

interface QrData {
  id: string;
  type: "INDIVIDUAL" | "TEAM" | "PERSONAL" | "TABLE" | "VENUE";
  label: string | null;
  venue: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  staff: Staff | null;
  recipients: Staff[];
}

const AMOUNT_PRESETS = [50000, 100000, 150000];

// InactiveStaffPopup component
function InactiveStaffPopup({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const t = useTranslations("guest.tip");
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('staffUnavailable')}
        </h3>
        <p className="text-gray-500 mb-4">
          {t('selectAnotherStaff')}
        </p>
        <Button
          onClick={onClose}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {t('selectAnother')}
        </Button>
      </div>
    </div>
  );
}

export default function TipPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const shortCode = params.shortCode as string;
  const t = useTranslations("guest.tip");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QrData | null>(null);

  const [amount, setAmount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittingGPay, setSubmittingGPay] = useState(false);
  const [showInactivePopup, setShowInactivePopup] = useState(false);

  // Get step and staffId from URL params (persists across refresh)
  const urlStaffId = searchParams.get('staff');
  const selectedStaffId = urlStaffId;
  const step = urlStaffId ? "amount" : "staff";

  // Function to update URL with staff selection
  const setSelectedStaff = (staffId: string | null) => {
    if (staffId) {
      router.replace(`/tip/${shortCode}?staff=${staffId}`, { scroll: false });
    } else {
      router.replace(`/tip/${shortCode}`, { scroll: false });
    }
  };

  useEffect(() => {
    fetchQrData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortCode]);

  // Helper to determine if QR type requires staff selection
  const isTeamQr = (type: string) => {
    return type === "TEAM" || type === "TABLE" || type === "VENUE";
  };

  const isIndividualQr = (type: string) => {
    return type === "INDIVIDUAL" || type === "PERSONAL";
  };

  async function fetchQrData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/tip/${shortCode}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError(t('qrInvalid'));
        } else {
          setError(t('somethingWrong'));
        }
        return;
      }
      const data = await res.json();
      setQrData(data);

      // If Individual QR with active staff, auto-select and go to amount (only if no staff in URL)
      if (isIndividualQr(data.type) && data.staff && !urlStaffId) {
        if (data.staff.status === 'INACTIVE') {
          setShowInactivePopup(true);
        } else {
          setSelectedStaff(data.staff.id);
        }
      } else if (isTeamQr(data.type)) {
        const activeRecipients = (data.recipients || []).filter(
          (s: Staff) => s.status !== 'INACTIVE'
        );
        if (activeRecipients.length === 0) {
          setError(t('venueNotAccepting'));
        }
      }
    } catch {
      setError(t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  }

  // Handle amount input change
  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except empty string
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setAmountInput(numericValue);
    setSelectedPreset(null);
    
    // Update amount
    const parsedAmount = numericValue === '' ? 0 : parseInt(numericValue, 10);
    setAmount(parsedAmount);
  };

  // Handle preset selection
  const handlePresetSelect = (presetAmount: number) => {
    setSelectedPreset(presetAmount);
    setAmount(presetAmount);
    setAmountInput('');
  };

  // Get final amount for display and validation
  const finalAmount = amount;

  const selectedStaff = selectedStaffId
    ? qrData?.staff?.id === selectedStaffId
      ? qrData?.staff
      : qrData?.recipients.find((s) => s.id === selectedStaffId)
    : null;

  // Get active recipients for Team QR
  const activeRecipients = qrData?.recipients?.filter(
    (s) => s.status !== 'INACTIVE'
  ) || [];

  // Check if we should show back button (Team QR on amount screen)
  const showBackButton = qrData && isTeamQr(qrData.type) && step === "amount";

  async function handleSubmit() {
    if (!finalAmount || finalAmount < 10000) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeId: qrData?.id,
          amount: finalAmount,
          staffId: selectedStaffId,
          type: "PERSONAL", // Always PERSONAL for new tips
          experienceRating: null,
          message: null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.code === 'STAFF_INACTIVE') {
          setShowInactivePopup(true);
          return;
        }
        throw new Error("Failed to create payment");
      }

      const { snapToken, redirectUrl } = await res.json();

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (snapToken && window.snap) {
        window.snap.pay(snapToken);
      }
    } catch {
      setError(t('failedPayment'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGooglePay() {
    if (!finalAmount || finalAmount < 10000) return;

    setSubmittingGPay(true);
    try {
      const res = await fetch("/api/tips/gpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeId: qrData?.id,
          amount: finalAmount,
          staffId: selectedStaffId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.code === 'STAFF_INACTIVE') {
          setShowInactivePopup(true);
          return;
        }
        throw new Error(errorData.error || "Failed to create Google Pay payment");
      }

      const { redirectUrl } = await res.json();

      // Redirect directly to Snap with Google Pay only
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch {
      setError(t('failedGooglePay'));
    } finally {
      setSubmittingGPay(false);
    }
  }

  function handleStaffSelect(staffId: string) {
    const staff = qrData?.recipients.find((s) => s.id === staffId);
    if (staff?.status === 'INACTIVE') {
      setShowInactivePopup(true);
      return;
    }
    setSelectedStaff(staffId);
  }

  function handleInactivePopupClose() {
    setShowInactivePopup(false);
    if (qrData && isIndividualQr(qrData.type)) {
      setError(t('staffNotAvailable'));
    } else {
      setSelectedStaff(null);
    }
  }

  function handleBack() {
    setSelectedStaff(null);
    setAmount(0);
    setAmountInput('');
    setSelectedPreset(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="w-full md:min-w-[672px] md:w-[672px] md:mx-auto flex items-center justify-center min-h-screen relative">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="w-full md:min-w-[672px] md:w-[672px] md:mx-auto relative">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center max-w-sm mx-auto">
            <h1 className="text-xl font-semibold mb-2 text-gray-900">{t('oops')}</h1>
            <p className="text-gray-500">{error || t('qrNotFound')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Staff Selection Screen (for Team QR)
  if (step === "staff" && isTeamQr(qrData.type) && activeRecipients.length > 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <InactiveStaffPopup 
          isOpen={showInactivePopup} 
          onClose={handleInactivePopupClose} 
        />
        <div className="w-full md:min-w-[672px] md:w-[672px] md:mx-auto flex flex-col min-h-screen relative">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-6 flex items-center justify-between relative rounded-b-[15px]">
          <div className="flex items-center gap-2">
            <Image
              src="/images/Logo_1.svg"
              alt="TIPSIO Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-heading font-bold text-gradient">
              TIPSIO
            </span>
          </div>
          <div className="absolute right-4 md:right-6">
            <LanguageSwitcher />
          </div>
        </header>

        {/* Venue Info */}
        <div className="bg-white px-4 md:px-6 py-4 border border-gray-100 rounded-[15px] mx-4 md:mx-6 mt-4">
          <div className="flex items-center gap-3">
            {qrData.venue.logoUrl ? (
              <Image
                src={qrData.venue.logoUrl}
                alt={qrData.venue.name}
                width={48}
                height={48}
                className="rounded-xl"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="text-amber-700 font-bold text-lg">
                  {qrData.venue.name.charAt(0)}
                </span>
              </div>
            )}
            <h1 className="text-xl font-semibold text-gray-900">{qrData.venue.name}</h1>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-6 py-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 text-center">
            {t('whoToThank')}
          </h2>

          <div className="flex flex-col gap-3">
            {activeRecipients.map((staff) => (
              <button
                key={staff.id}
                onClick={() => handleStaffSelect(staff.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all bg-white min-h-[88px] ${
                  selectedStaffId === staff.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-600 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {staff.avatarUrl ? (
                      <Image
                        src={staff.avatarUrl}
                        alt={staff.displayName}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{staff.displayName}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {staff.role.charAt(0) + staff.role.slice(1).toLowerCase()} {qrData.venue.name}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
        </div>
      </div>
    );
  }

  // Tip Amount Screen
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <InactiveStaffPopup 
        isOpen={showInactivePopup} 
        onClose={handleInactivePopupClose} 
      />
      <div className="w-full md:min-w-[672px] md:w-[672px] md:mx-auto flex flex-col min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-6 flex items-center justify-between relative rounded-b-[15px]">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('backToStaffSelection')}
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <Image
            src="/images/Logo_1.svg"
            alt="TIPSIO Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-heading font-bold text-gradient">
            TIPSIO
          </span>
        </div>
        <div className="absolute right-4 md:right-6">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Staff Info */}
      {selectedStaff && (
        <div className="bg-white px-4 md:px-6 py-4 border border-gray-100 rounded-[15px] mx-4 md:mx-6 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{selectedStaff.displayName}</h1>
              <p className="text-gray-500 text-sm">
                {selectedStaff.role.charAt(0) + selectedStaff.role.slice(1).toLowerCase()} {t('at')} {qrData.venue.name}
              </p>
            </div>
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              {selectedStaff.avatarUrl ? (
                <Image
                  src={selectedStaff.avatarUrl}
                  alt={selectedStaff.displayName}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-6 py-6 pb-32">
        {/* Tip Amount */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">{t('tipAmountTitle')}</h2>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={t('enterAmountPlaceholder')}
            value={amountInput}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="bg-white border-gray-200 h-12 text-gray-900 placeholder:text-gray-400 mb-3"
          />
          <div className="grid grid-cols-3 gap-2">
            {AMOUNT_PRESETS.map((presetAmount) => (
              <button
                key={presetAmount}
                onClick={() => handlePresetSelect(presetAmount)}
                className={`h-12 rounded-xl border-2 font-medium transition-all ${
                  selectedPreset === presetAmount
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-900 hover:border-blue-600 hover:bg-blue-50"
                }`}
              >
                Rp {(presetAmount / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center">
        <div className="w-full md:min-w-[672px] md:w-[672px] bg-white border-t border-gray-100 p-4 space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!finalAmount || finalAmount < 10000 || submitting || submittingGPay}
            className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-xl text-white"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>{t('sendButton', { amount: finalAmount > 0 ? finalAmount.toLocaleString('id-ID') : "0" })}</>
            )}
          </Button>
          
          {/* Google Pay Button */}
          <button
            id="google-pay-button"
            onClick={handleGooglePay}
            disabled={!finalAmount || finalAmount < 10000 || submitting || submittingGPay}
            className="w-full h-14 bg-black hover:bg-gray-900 active:bg-gray-800 disabled:opacity-50 rounded-xl border-0 flex items-center justify-center overflow-hidden"
            style={{
              background: 'black',
              backgroundOrigin: 'content-box',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              border: '0',
              borderRadius: '12px',
              boxShadow: 'none',
              height: '56px',
              minHeight: '56px',
              padding: '12px 24px',
            }}
          >
            {submittingGPay ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <div style={{
                background: 'no-repeat center/contain',
                backgroundImage: 'url(https://www.gstatic.com/instantbuy/svg/dark_gpay.svg)',
                height: '100%',
                width: '100%',
                minWidth: '90px',
              }} />
            )}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string) => void;
    };
  }
}
