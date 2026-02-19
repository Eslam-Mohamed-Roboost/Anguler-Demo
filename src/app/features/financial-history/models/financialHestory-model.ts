export interface financialHestory{
    id: number;
    tripId: string;
    driver: string;
    guestName: string;
    roomNo: string;
    routeFrom: string;
    routeTo: string;
    durationMin: number;
    distanceKm: number;
    tripProfit : number;
    CommulativeProfit: number;
    startDate: string;
    endDate: string;
}