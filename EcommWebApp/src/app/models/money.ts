export function formatRand(amount: number): string {
  const body = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${body}`;
}
