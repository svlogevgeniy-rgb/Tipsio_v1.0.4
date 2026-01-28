'use client';

import Image from 'next/image';
import { User } from 'lucide-react';
import type { Staff } from './schema';

interface StaffAvatarProps {
  staff: Staff;
}

export function StaffAvatar({ staff }: StaffAvatarProps) {
  if (staff.avatarUrl) {
    return (
      <Image
        src={staff.avatarUrl}
        alt={staff.displayName}
        width={48}
        height={48}
        className="w-12 h-12 rounded-full object-cover"
      />
    );
  }

  const initials = staff.displayName
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
      {initials ? (
        <span className="text-primary font-semibold">{initials}</span>
      ) : (
        <User className="h-5 w-5 text-primary" />
      )}
    </div>
  );
}
