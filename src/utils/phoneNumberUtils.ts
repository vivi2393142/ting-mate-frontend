import { ICountry, getCountryByPhoneNumber } from 'react-native-international-phone-number';

export const getMergedPhone = (phoneNumber: string, phoneCountry: ICountry) =>
  `${phoneCountry.idd.root}${phoneNumber}`;

export const getSeparatedPhone = (phone: string) => {
  const phoneCountry = getCountryByPhoneNumber(phone);
  if (!phoneCountry) return null;

  const callingCode = phoneCountry.idd.root;
  return { phoneCountry, phoneNumber: phone.replace(`${callingCode}`, '') };
};

export const getDisplayPhone = (phone: string) => {
  const separatedPhone = getSeparatedPhone(phone);
  if (!separatedPhone) return '';

  const { phoneCountry, phoneNumber } = separatedPhone;
  return `${phoneCountry?.idd.root} ${phoneNumber}`;
};
