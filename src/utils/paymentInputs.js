export function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length < 2) return digits;
  if (digits.length === 2) return `${digits}/`;

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function formatCvv(value) {
  return value.replace(/\D/g, '').slice(0, 3);
}

export function isValidCardDetails(cardDetails) {
  const cardNumber = cardDetails.number.replace(/\s/g, '');
  const expiryMatch = cardDetails.expiry.match(/^(\d{2})\/(\d{2})$/);
  const month = expiryMatch ? Number(expiryMatch[1]) : 0;

  return (
    cardDetails.name.trim().length > 0 &&
    cardNumber.length === 16 &&
    Boolean(expiryMatch) &&
    month >= 1 &&
    month <= 12 &&
    /^\d{3}$/.test(cardDetails.cvv) &&
    cardDetails.cvv !== '000'
  );
}
