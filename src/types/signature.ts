export interface RegistrarSignature {
  id: number;
  adminUserId: number;
  registryId: number;
  registryCode: string | null;
  registryName: string | null;
  fileName: string | null;
  fileSize: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
