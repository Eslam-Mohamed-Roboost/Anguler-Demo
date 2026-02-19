export interface Trip {
  id: number;
  tripId: string;
  driver: string;
  guestName: string;
  roomNo: string;
  routeFrom: string;
  routeTo: string;
  status: 'Completed' | 'Cancelled' | 'Scheduled' | 'Waiting Driver' | 'Active';
  durationMin: number;
  distanceKm: number;
  fare: number;
  commission: number;
  startDate: string;
  endDate: string;
}