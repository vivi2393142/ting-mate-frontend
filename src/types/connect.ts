export enum ContactMethod {
  PHONE = 'PHONE',
  WHATSAPP = 'WHATSAPP',
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  contactMethods: ContactMethod[];
}
