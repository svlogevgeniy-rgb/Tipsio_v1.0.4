"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Loader2, User, ArrowLeft, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Textarea } from "@/components/ui/textarea";
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
          {t('staffUnavailable') || 'Staff Unavailable'}
        </h3>
        <p className="text-gray-500 mb-4">
          Выберите другого сотрудника!
        </p>
        <Button
          onClick={onClose}
          className="w-full h-12 bg-green-700 hover:bg-green-800"
        >
          {t('selectAnother') || 'Select Another'}
        </Button>
      </div>
    </div>
  );
}

export default function TipPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QrData | null>(null);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [experienceRating, setExperienceRating] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showInactivePopup, setShowInactivePopup] = useState(false);
  const MAX_MESSAGE_LENGTH = 99;

  // Step: 'staff' for staff selection, 'amount' for tip amount
  const [step, setStep] = useState<"staff" | "amount">("staff");

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
          setError("This QR code is not valid or has been deactivated.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }
      const data = await res.json();
      setQrData(data);

      // If Individual QR with active staff, skip staff selection
      if (isIndividualQr(data.type) && data.staff) {
        if (data.staff.status === 'INACTIVE') {
          // Show inactive popup for individual QR
          setShowInactivePopup(true);
        } else {
          setSelectedStaffId(data.staff.id);
          setStep("amount");
        }
      } else if (isTeamQr(data.type)) {
        // For Team QR, check if there are active recipients
        const activeRecipients = (data.recipients || []).filter(
          (s: Staff) => s.status !== 'INACTIVE'
        );
        if (activeRecipients.length === 0) {
          setError("This venue is not accepting tips at the moment.");
        }
      }
    } catch {
      setError("Failed to load. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const selectedStaff = selectedStaffId
    ? qrData?.staff?.id === selectedStaffId
      ? qrData?.staff
      : qrData?.recipients.find((s) => s.id === selectedStaffId)
    : null;

  // Get active recipients for Team QR
  const activeRecipients = qrData?.recipients?.filter(
    (s) => s.status !== 'INACTIVE'
  ) || [];

  async function handleSubmit() {
    if (!finalAmount || finalAmount < 1000) return;

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
          experienceRating: experienceRating,
          message: message.trim() || null,
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
      setError("Failed to process payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleStaffSelect(staffId: string) {
    const staff = qrData?.recipients.find((s) => s.id === staffId);
    if (staff?.status === 'INACTIVE') {
      setShowInactivePopup(true);
      return;
    }
    setSelectedStaffId(staffId);
    setStep("amount");
  }

  function handleInactivePopupClose() {
    setShowInactivePopup(false);
    // For Individual QR with inactive staff, show error
    if (qrData && isIndividualQr(qrData.type)) {
      setError("This staff member is not available. Please try another QR code.");
    } else {
      // For Team QR, go back to selection
      setStep("staff");
      setSelectedStaffId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-[759px] mx-auto flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[759px] mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center max-w-sm mx-auto">
            <h1 className="text-xl font-semibold mb-2 text-gray-900">Oops!</h1>
            <p className="text-gray-500">{error || "QR code not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Staff Selection Screen (for Team QR)
  if (step === "staff" && isTeamQr(qrData.type) && activeRecipients.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <InactiveStaffPopup 
          isOpen={showInactivePopup} 
          onClose={handleInactivePopupClose} 
        />
        <div className="w-full max-w-[759px] mx-auto flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-green-700 font-semibold text-lg">tipsio</span>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </header>

        {/* Venue Info */}
        <div className="bg-white px-4 py-4 border-b border-gray-100">
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
        <main className="flex-1 px-4 py-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Who would you like to thank?
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {activeRecipients.map((staff) => (
              <button
                key={staff.id}
                onClick={() => handleStaffSelect(staff.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all bg-white hover:border-green-500 ${
                  selectedStaffId === staff.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
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

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 p-4 text-center">
          <p className="text-sm text-gray-400">© 2026 TIPSIO.</p>
        </footer>
        </div>
      </div>
    );
  }

  // Tip Amount Screen
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <InactiveStaffPopup 
        isOpen={showInactivePopup} 
        onClose={handleInactivePopupClose} 
      />
      <div className="w-full max-w-[759px] mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
        <button 
          onClick={() => isTeamQr(qrData.type) && activeRecipients.length > 0 ? setStep("staff") : null}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-green-700 font-semibold text-lg">tipsio</span>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Staff Info */}
      {selectedStaff && (
        <div className="bg-white px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{selectedStaff.displayName}</h1>
              <p className="text-gray-500 text-sm">
                {selectedStaff.role.charAt(0) + selectedStaff.role.slice(1).toLowerCase()} at {qrData.venue.name}
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
      <main className="flex-1 px-4 py-6 pb-32">
        {/* Tip Amount */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Tip Amount</h2>
          <Input
            type="number"
            placeholder="Amount"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            className="bg-white border-gray-200 h-12 text-gray-900 placeholder:text-gray-400 mb-3"
          />
          <div className="grid grid-cols-3 gap-2">
            {AMOUNT_PRESETS.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
                className={`h-12 rounded-xl border-2 font-medium transition-all ${
                  selectedAmount === amount
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-200 bg-white text-gray-900 hover:border-green-500"
                }`}
              >
                Rp {(amount / 1000).toFixed(0)}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Rating */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Your Experience</h2>
          <div className="flex gap-2">
            {[
              { key: "okay", emoji: "🙂" },
              { key: "good", emoji: "😊" },
              { key: "great", emoji: "😀" },
              { key: "excellent", emoji: "😍" },
            ].map(({ key, emoji }) => (
              <button
                key={key}
                onClick={() => setExperienceRating(experienceRating === key ? null : key)}
                className={`flex-1 h-14 rounded-xl border-2 text-2xl transition-all ${
                  experienceRating === key
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => setExperienceRating(null)}
              className="w-14 h-14 rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300 transition-all flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Message</h2>
          <div className="relative">
            <Textarea
              placeholder="Add a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 min-h-[100px] resize-none pr-16"
              maxLength={MAX_MESSAGE_LENGTH}
            />
            <span className="absolute bottom-3 right-3 text-sm text-gray-400">
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center">
        <div className="w-full max-w-[759px] bg-white border-t border-gray-100 p-4">
          <p className="text-sm text-gray-400 text-center mb-3">
            © 2026 TIPSIO.
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!finalAmount || finalAmount < 1000 || submitting}
            className="w-full h-14 text-lg font-semibold bg-green-700 hover:bg-green-800 disabled:opacity-50 rounded-xl"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>Send {finalAmount > 0 ? (finalAmount / 1000).toFixed(0) : ""}</>
            )}
          </Button>
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
