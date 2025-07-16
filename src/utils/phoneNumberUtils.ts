import { ICountry, getCountryByPhoneNumber } from 'react-native-international-phone-number';

export const getMergedPhone = (phoneNumber: string, phoneCountry: ICountry) =>
  `${phoneCountry.idd.root}${phoneNumber}`;

export const getSeparatedPhone = (phone: string) => {
  const phoneCountry = getCountryByPhoneNumber(phone);
  const callingCode = phoneCountry?.idd?.root;
  return { phoneCountry, phoneNumber: phone.replace(`${callingCode}`, '') };
};

export const getDisplayPhone = (phone: string) => {
  const { phoneCountry, phoneNumber } = getSeparatedPhone(phone);
  return `${phoneCountry?.idd.root} ${phoneNumber}`;
};
