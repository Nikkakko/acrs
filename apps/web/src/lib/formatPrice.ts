/**
 * Format price for display. Handles string or number input.
 * Returns "$X" or "$X.XX" when valid; empty string otherwise.
 */
export function formatPrice(price: string | number | undefined | null): string {
  if (price == null || price === "") return "";
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}
