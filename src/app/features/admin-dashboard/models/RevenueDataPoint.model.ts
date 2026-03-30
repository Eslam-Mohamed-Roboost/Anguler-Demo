 

export type MetricType = 'TotalRevenue' | 'AppProfit' | 'DriversProfits';


export interface RevenueDataPointData {
  dataPoints: DataPoint[]
  year: number
  metricType: string
}

export interface DataPoint {
  month: number
  monthName: string
  value: number
  year: number
}
