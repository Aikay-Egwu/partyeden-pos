/**
 * Shared currency formatter — storefront and admin both price in GBP.
 * Accepts backend decimal strings or numbers and always renders 2 dp.
 */
export function formatCurrency(value: string | number): string {
    return `£${Number(value).toFixed(2)}`;
}
