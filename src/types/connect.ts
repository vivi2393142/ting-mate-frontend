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

export interface AddressData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface SafeZone {
  location: AddressData;
  radius: number;
}
