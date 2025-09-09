const currencySymbols = {
  GBP: "£",
  GBX: "p",
  USD: "$",
  EUR: "€",
  CHF: "Fr",
};

export function formatCurrency(value, currency = "GBP", decimals = 2) {
  const symbol = currencySymbols[currency] || "";
  const formattedValue = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
}).format(value);
  return `${symbol}${formattedValue}`;
}