const pad = (n: number): string => String(n).padStart(2, '0')

export const formatHours = (open: number, close: number): string =>
  `Open ${pad(open)}:00 – ${pad(close)}:00`
