"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { staffSchema, type StaffForm, type Staff } from "@/components/venue/staff/schema";
import { StaffDialog } from "@/components/venue/staff/staff-dialog";
import { StaffList } from "@/components/venue/staff/staff-list";
import { useAvatarUpload } from "@/components/venue/staff/use-avatar-upload";
import { useStaffManagement } from "@/components/venue/staff/use-staff-management";
import { useTranslations } from "@/i18n/client";

export default function StaffManagementPage() {
  const t = useTranslations("venue.staff");
  const { staff, isPageLoading, addStaff, updateStaff, toggleStatus, deleteStaff } = useStaffManagement();
  const { avatarFile, avatarPreview, selectFile, clearAvatar, setPreviewFromUrl } = useAvatarUpload();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
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

  const handleOpenAddDialog = () => {
    setEditingStaff(null);
    form.reset({ displayName: "", fullName: "", role: "WAITER", avatarUrl: "" });
    clearAvatar();
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    form.reset({
      displayName: staffMember.displayName,
      fullName: staffMember.fullName || "",
      role: staffMember.role as StaffForm["role"],
      avatarUrl: staffMember.avatarUrl || "",
    });
    clearAvatar();
    if (staffMember.avatarUrl) {
      setPreviewFromUrl(staffMember.avatarUrl);
    }
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: StaffForm) => {
    setFormError(null);
    setIsSaving(true);
    setIsUploading(Boolean(avatarFile));
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, data, avatarFile);
      } else {
        await addStaff(data, avatarFile);
      }
      setDialogOpen(false);
      setEditingStaff(null);
      form.reset({ displayName: "", fullName: "", role: "WAITER", avatarUrl: "" });
      clearAvatar();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save staff");
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
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingStaff(null);
              form.reset({ displayName: "", fullName: "", role: "WAITER", avatarUrl: "" });
              clearAvatar();
              setFormError(null);
            }
          }}
          triggerLabel={t("addStaff")}
          onSubmit={handleSubmit}
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
          editingStaff={editingStaff}
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
        onEdit={handleOpenEditDialog}
        onEmptyAction={handleOpenAddDialog}
      />
    </div>
  );
}
