"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "@/i18n/client";
import { staffSchema, type StaffForm, type Staff } from "@/components/venue/staff/schema";
import { useStaffManagement } from "@/components/venue/staff/use-staff-management";
import { useAvatarUpload } from "@/components/venue/staff/use-avatar-upload";
import { StaffDialog } from "@/components/venue/staff/staff-dialog";
import { StaffList } from "@/components/venue/staff/staff-list";

export default function StaffManagementPage() {
  const t = useTranslations("venue.staff");
  const { staff, isPageLoading, addStaff, toggleStatus, deleteStaff } = useStaffManagement();
  const { avatarFile, avatarPreview, selectFile, clearAvatar } = useAvatarUpload();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      displayName: "",
      fullName: "",
      role: "WAITER",
      avatarUrl: "",
    },
  });

  const roleLabels: Record<string, string> = {
    WAITER: t("roles.waiter"),
    BARTENDER: t("roles.bartender"),
    BARISTA: t("roles.barista"),
    HOSTESS: t("roles.hostess"),
    CHEF: t("roles.chef"),
    ADMINISTRATOR: t("roles.administrator"),
    OTHER: t("roles.other"),
  };

  const handleAddStaff = async (data: StaffForm) => {
    setFormError(null);
    setIsSaving(true);
    setIsUploading(Boolean(avatarFile));
    try {
      await addStaff(data, avatarFile);
      setDialogOpen(false);
      form.reset({ displayName: "", fullName: "", role: "WAITER" });
      clearAvatar();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const handleDeleteStaff = async (staffMember: Staff) => {
    if (!window.confirm(t("deleteConfirm", { name: staffMember.displayName }))) return;
    try {
      await deleteStaff(staffMember);
    } catch (err) {
      console.error(err);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <StaffDialog
          form={form}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          triggerLabel={t("addStaff")}
          onSubmit={handleAddStaff}
          error={formError}
          isLoading={isSaving}
          isUploading={isUploading}
          avatarPreview={avatarPreview}
          onFileSelect={(file) => {
            const message = selectFile(file);
            if (message) {
              setFormError(message);
            }
            return message;
          }}
          onClearAvatar={() => {
            clearAvatar();
            setFormError(null);
          }}
        />
      </div>

      <StaffList
      staff={staff}
      roleLabels={roleLabels}
      onToggleStatus={async (member) => {
        try {
          await toggleStatus(member);
        } catch (err) {
          console.error(err);
        }
      }}
      onDelete={handleDeleteStaff}
      onEmptyAction={() => setDialogOpen(true)}
    />
    </div>
  );
}
