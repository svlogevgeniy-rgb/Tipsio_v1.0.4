'use client';

import { useCallback, useState } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024;

export function useAvatarUpload() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const selectFile = useCallback((file?: File) => {
    if (!file) return null;
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Только JPEG, PNG, WebP или GIF';
    }
    if (file.size > MAX_SIZE) {
      return 'Файл слишком большой. Максимум 5MB';
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    return null;
  }, []);

  const clearAvatar = useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview(null);
  }, []);

  return {
    avatarFile,
    avatarPreview,
    selectFile,
    clearAvatar,
  };
}
