// Shared wording for restaurant family offers (stored in the `coupons` table)

// 0 = Sunday … 6 = Saturday, shown Monday first
export const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

export function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')}${suffix}` : `${hour}${suffix}`;
}

export function describeDays(days: number[] | null) {
  if (!days || days.length === 0 || days.length === 7) return 'Every day';
  const sorted = DAYS.filter((d) => days.includes(d.value));
  if (sorted.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
  if (sorted.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
  return sorted.map((d) => d.label).join(', ');
}

export function describeTimes(start: string | null, end: string | null) {
  if (!start || !end) return 'All day';
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function describeOffer(discountType: string, discountValue: number) {
  if (discountType === 'kids_meal') return 'Free kids meal with every adult meal';
  if (discountType === 'percentage') return `${Number(discountValue)}% off the food bill`;
  return `${Number(discountValue)} off`;
}
