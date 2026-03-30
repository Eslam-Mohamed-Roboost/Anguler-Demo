export interface DashboardOverview {
  allDrivers: AllDrivers
  onlineNow: OnlineNow
  pendingRegistrations: PendingRegistrations
  driversProfits: DriversProfits
  appProfit: AppProfit
  onTrip: OnTrip
  driversRights: DriversRights
  appRights: AppRights
}

export interface AllDrivers {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface OnlineNow {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface PendingRegistrations {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface DriversProfits {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface AppProfit {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface OnTrip {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface DriversRights {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}

export interface AppRights {
  value: number
  percentageChange: number
  comparisonDescription: string
  changeType: number
}
