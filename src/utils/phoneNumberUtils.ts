// Phone number utilities
export const cleanPhoneInput = (text: string): string => {
  // Only allow digits and + at the beginning
  const cleaned = text.replace(/[^\d+]/g, '');

  // If it starts with +, keep the + and digits
  if (cleaned.startsWith('+')) {
    return '+' + cleaned.slice(1).replace(/[^\d]/g, '');
  }

  // Otherwise, just digits
  return cleaned.replace(/[^\d]/g, '');
};

export const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return '';

  // If it starts with +, format with spaces
  if (phone.startsWith('+')) {
    const digits = phone.slice(1);
    const formatted = digits.replace(/(\d{3})(?=\d)/g, '$1 ');
    return `+${formatted}`;
  }

  // For local numbers, format with spaces
  const formatted = phone.replace(/(\d{3})(?=\d)/g, '$1 ');
  return formatted;
};

export const validatePhoneNumber = (text: string): boolean => {
  const digits = text.replace(/[^\d]/g, '');
  return digits.length >= 7;
};
