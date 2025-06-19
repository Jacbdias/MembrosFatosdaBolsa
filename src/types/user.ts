export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  plan?: 'VIP' | 'LITE' | 'RENDA_PASSIVA' | 'FIIS' | 'AMERICA';  // ✅ MODIFICADO
  [key: string]: unknown;
}
