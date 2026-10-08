export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function validatePhone(phone: string): boolean {
  return /^\+?[1-9]\d{7,14}$/.test(phone.replace(/\s+/g, ""));
}

export function validateNin(nin: string): boolean {
  return /^\d{11}$/.test(nin.trim());
}
