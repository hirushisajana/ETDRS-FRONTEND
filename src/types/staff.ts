export interface StaffMember {
  id: number;
  fullName: string;
  email: string;
  role: StaffRole;
  status: string;
  inviteExpiresAt: string | null;
  invitedByName: string | null;
  createdAt: string | null;
}

export type StaffRole = 'COUNTER_USER' | 'DAYBOOK_USER' | 'FOLIO_USER';

export const STAFF_ROLES: { role: StaffRole; label: string; description: string }[] = [
  { role: 'COUNTER_USER', label: 'Counter User', description: 'Manages counter operations and deed intake' },
  { role: 'DAYBOOK_USER', label: 'Daybook User', description: 'Records and manages daybook entries' },
  { role: 'FOLIO_USER', label: 'Folio User', description: 'Creates and manages folio volumes' },
];

export function staffRoleLabel(role: StaffRole): string {
  const map: Record<StaffRole, string> = {
    COUNTER_USER: 'Counter User',
    DAYBOOK_USER: 'Daybook User',
    FOLIO_USER: 'Folio User',
  };
  return map[role];
}
