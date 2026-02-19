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

export interface PayoutAlert {
    id: number;
    type: 'scheduled' | 'processed';
    amount: number;
    message: string;
}

export type FinancialHistoryItem = financialHestory | PayoutAlert;