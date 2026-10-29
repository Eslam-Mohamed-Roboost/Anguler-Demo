import type { TranslationKey } from '../../../core/i18n/translations';

/** `status` query values accepted by `GET /hotels/trips`. */
export const TRIP_STATUS_FILTERS = [
  'searching',
  'assigned',
  'enroute',
  'onsite',
  'active',
  'completed',
  'cancelled',
] as const;

/** `bookingType` query values accepted by `GET /hotels/trips`. */
export const BOOKING_TYPE_FILTERS = ['direct', 'scheduled'] as const;

export type BookingType = (typeof BOOKING_TYPE_FILTERS)[number];

/** `statusEnum`: 1 Searching · 2 Assigned · 3 En Route · 4 On Site · 5 Active · 6 Completed · 7 Cancelled */
const STATUS_BY_ENUM: Record<number, string> = {
  1: 'Searching',
  2: 'Assigned',
  3: 'EnRoute',
  4: 'OnSite',
  5: 'Active',
  6: 'Completed',
  7: 'Cancelled',
};

const STATUS_KEYS: Record<string, TranslationKey> = {
  searching: 'tripDetails.status.Searching',
  pending: 'tripDetails.status.Searching',
  assigned: 'tripDetails.status.Assigned',
  enroute: 'tripDetails.status.EnRoute',
  accepted: 'tripDetails.status.EnRoute',
  onsite: 'tripDetails.status.OnSite',
  arrived: 'tripDetails.status.OnSite',
  active: 'tripDetails.status.Active',
  inprogress: 'tripDetails.status.Active',
  completed: 'tripDetails.status.Completed',
  scheduled: 'tripDetails.status.Scheduled',
  rejected: 'tripDetails.status.Rejected',
};

const BOOKING_TYPE_KEYS: Record<BookingType, TranslationKey> = {
  direct: 'hotelTrip.bookingDirect',
  scheduled: 'hotelTrip.bookingScheduled',
};

export function compactStatus(status: string | null | undefined): string {
  return status?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') ?? '';
}

/** Unified trip status from the API (`statusString`, falling back to `statusEnum`). */
export function unifiedTripStatus(item: { statusString?: string | null; statusEnum?: number | null }): string | null {
  const text = item.statusString?.trim();
  if (text) return text;
  return item.statusEnum != null ? STATUS_BY_ENUM[item.statusEnum] ?? null : null;
}

export function bookingTypeOf(item: {
  bookingTypeString?: string | null;
  bookingTypeEnum?: number | null;
  isScheduled?: boolean;
}): BookingType {
  const text = compactStatus(item.bookingTypeString);
  if (text === 'direct' || text === 'scheduled') return text;
  if (item.bookingTypeEnum === 1) return 'direct';
  if (item.bookingTypeEnum === 2) return 'scheduled';
  return item.isScheduled ? 'scheduled' : 'direct';
}

export function tripStatusKey(status: string | null | undefined): TranslationKey | null {
  const key = compactStatus(status);
  if (key.includes('cancel')) return 'tripDetails.status.Cancelled';
  return STATUS_KEYS[key] ?? null;
}

export function bookingTypeKey(type: BookingType): TranslationKey {
  return BOOKING_TYPE_KEYS[type];
}
