/**
 * Indonesian locale formatters for dates, times, numbers, and currency
 */

const INDONESIAN_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
]

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

/**
 * Formats a date in Indonesian format
 * Example: "Jumat, 6 Desember 2024"
 */
export function formatDateIndonesian(date: Date): string {
  const dayName = INDONESIAN_DAYS[date.getDay()]
  const day = date.getDate()
  const monthName = INDONESIAN_MONTHS[date.getMonth()]
  const year = date.getFullYear()
  
  return `${dayName}, ${day} ${monthName} ${year}`
}

/**
 * Formats a date in short Indonesian format
 * Example: "6 Des 2024"
 */
export function formatDateShortIndonesian(date: Date): string {
  const day = date.getDate()
  const monthName = INDONESIAN_MONTHS[date.getMonth()].substring(0, 3)
  const year = date.getFullYear()
  
  return `${day} ${monthName} ${year}`
}

/**
 * Formats time in 24-hour format (Indonesian standard)
 * Example: "14:30"
 */
export function formatTimeIndonesian(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${hours}:${minutes}`
}

/**
 * Formats a number with Indonesian thousand separators
 * Indonesian uses "." as thousand separator and "," as decimal separator
 * Example: 1000000.5 -> "1.000.000,5"
 */
export function formatNumberIndonesian(num: number): string {
  const [intPart, decPart] = num.toString().split('.')
  
  // Add thousand separators to integer part
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  if (decPart) {
    return `${formattedInt},${decPart}`
  }
  
  return formattedInt
}

/**
 * Formats currency in IDR format
 * Example: 50000 -> "Rp 50.000"
 */
export function formatCurrencyIDR(amount: number): string {
  const formattedAmount = formatNumberIndonesian(Math.round(amount))
  return `Rp ${formattedAmount}`
}

/**
 * Runtime Intl formatter reused across requests/components.
 */
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formats currency with Intl.NumberFormat to match legacy components that used Intl directly.
 * Example: formatCurrencyIDRIntl(50000) -> "Rp 50.000"
 */
export function formatCurrencyIDRIntl(amount: number): string {
  return currencyFormatter.format(amount);
}

/**
 * Formats currency with full label
 * Example: 50000 -> "Rp 50.000 IDR"
 */
export function formatCurrencyIDRFull(amount: number): string {
  return `${formatCurrencyIDR(amount)} IDR`
}

/**
 * Gets Indonesian day name
 */
export function getIndonesianDayName(dayIndex: number): string {
  return INDONESIAN_DAYS[dayIndex] || ''
}

/**
 * Gets Indonesian month name
 */
export function getIndonesianMonthName(monthIndex: number): string {
  return INDONESIAN_MONTHS[monthIndex] || ''
}

/**
 * Exports for testing
 */
export const DAYS = INDONESIAN_DAYS
export const MONTHS = INDONESIAN_MONTHS

const shortDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Formats a date (string/number/Date) into a short Indonesian date with time.
 * Example: "2024-12-06T12:30:00Z" -> "6 Des 19.30" (depending on locale rules)
 */
export function formatDateTimeShort(date: string | number | Date): string {
  const parsedDate = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return shortDateTimeFormatter.format(parsedDate);
}

/**
 * Formats a date range in short format
 * Example: formatDateRange("2024-01-01", "2024-01-07") -> "1 Jan – 7 Jan"
 */
export function formatDateRange(start: string | Date, end: string | Date): string {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${startDate.toLocaleDateString("en-US", options)} – ${endDate.toLocaleDateString("en-US", options)}`;
}

/**
 * Formats a date in short format (month + day)
 * Example: formatDateShort("2024-12-06") -> "Dec 6"
 */
export function formatDateShort(date: string | Date): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Formats a date with weekday, day, and month
 * Example: formatDateWithWeekday("2024-12-06") -> "Fri, Dec 6"
 */
export function formatDateWithWeekday(date: string | Date): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return parsedDate.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Formats a date and time in full format
 * Example: formatDateTime("2024-12-06T12:30:00Z") -> "Dec 6, 2024, 12:30 PM"
 */
export function formatDateTime(date: string | Date): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return parsedDate.toLocaleString("en-US");
}

/**
 * Formats a number with thousand separators using locale
 * Example: formatNumber(1000000) -> "1,000,000"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}
