import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { StatisticsCardComponent } from '../../../../shared/components/statistics-card/statistics-card.component';
import type { IconName } from '../../../../shared/components/icon/icon.component';
import type { DashboardOverview } from '../../models/dashboard-overview.model';
import { DashboardService } from '../../Services/dashboard.service';
import { RevenueChartComponent, RevenueDataPoint } from '../../components/revenue-chart/revenue-chart.component';
import { RecentTripsComponent } from '../../components/recent-trips/recent-trips.component';
import { ImportantAlertsComponent } from '../../components/important-alerts/important-alerts.component';
import { PayoutsTableComponent } from '../../components/payouts-table/payouts-table.component';
import { RevenueDataPointData } from '../../models/RevenueDataPoint.model';

interface DashboardStat {
  label: string;
  value: string | number;
  icon: IconName;
  color: 'green' | 'orange' | 'red' | 'blue' | 'purple' | 'yellow' | 'indigo';
  changePercent: number;
  changeDescription: string;
}

@Component({
  selector: 'app-home-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, StatisticsCardComponent, RevenueChartComponent, RecentTripsComponent, ImportantAlertsComponent, PayoutsTableComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly overview = signal<DashboardOverview | null>(null);
  readonly RevenueChart = signal<RevenueDataPointData | null>(null);

  readonly statistics = computed<DashboardStat[]>(() => {
    const o = this.overview();
    if (!o) return [];

    return [
      { label: 'All Drivers', value: o.allDrivers.value, icon: 'car', color: 'blue', changePercent: o.allDrivers.percentageChange, changeDescription: o.allDrivers.comparisonDescription },
      { label: 'Online Now', value: o.onlineNow.value, icon: 'users', color: 'green', changePercent: o.onlineNow.percentageChange, changeDescription: o.onlineNow.comparisonDescription },
      { label: 'Pending Registrations', value: o.pendingRegistrations.value, icon: 'alert-triangle', color: 'orange', changePercent: o.pendingRegistrations.percentageChange, changeDescription: o.pendingRegistrations.comparisonDescription },
      { label: 'On Trip', value: o.onTrip.value, icon: 'map-pin', color: 'green', changePercent: o.onTrip.percentageChange, changeDescription: o.onTrip.comparisonDescription },
      { label: 'Drivers Profits', value: o.driversProfits.value, icon: 'dollar-sign', color: 'purple', changePercent: o.driversProfits.percentageChange, changeDescription: o.driversProfits.comparisonDescription },
      { label: 'App Profit', value: o.appProfit.value, icon: 'dollar-sign', color: 'indigo', changePercent: o.appProfit.percentageChange, changeDescription: o.appProfit.comparisonDescription },
      { label: 'Drivers Rights', value: o.driversRights.value, icon: 'car', color: 'yellow', changePercent: o.driversRights.percentageChange, changeDescription: o.driversRights.comparisonDescription },
      { label: 'App Rights', value: o.appRights.value, icon: 'bar-chart', color: 'red', changePercent: o.appRights.percentageChange, changeDescription: o.appRights.comparisonDescription },
    ];
  });

  readonly revenueData = computed<RevenueDataPoint[]>(() => {
    const o = this.RevenueChart();
    if (!o) return [];
    return o.dataPoints.map((p) => ({ month: p.monthName, value: p.value }));
  });

 
  readonly recentTrips = signal([
    { id: 'TR001', status: 'Active' as const, price: 15.50, driverName: 'John Doe', passengerName: 'Alice Johnson', pickupLocation: '8058 Zurich-Flughafen, Switzerland', dropoffLocation: '8058 Zurich-Flughafen, Switzerland', timeAgo: '2 min ago' },
    { id: 'TR001', status: 'Completed' as const, price: 15.50, driverName: 'John Doe', passengerName: 'Alice Johnson', pickupLocation: '8058 Zurich-Flughafen, Switzerland', dropoffLocation: '8058 Zurich-Flughafen, Switzerland', timeAgo: '2 min ago' },
    { id: 'TR001', status: 'Canceled' as const, price: 15.50, driverName: 'John Doe', passengerName: 'Alice Johnson', pickupLocation: '8058 Zurich-Flughafen, Switzerland', dropoffLocation: '8058 Zurich-Flughafen, Switzerland', timeAgo: '2 min ago' },
  ]);

  readonly importantAlerts = signal([
    { name: 'Alice Johnson', role: 'Rider' as const, message: 'I have a problem with the driver now about finances, he doesn\'t want to drop me off.', timeAgo: '2 min ago', avatarColor: '#f59e0b' },
    { name: 'Alice Johnson', role: 'Driver' as const, message: 'The passenger does not want to pay the cost of the trip, and now I do not know how to deal with him.', timeAgo: '2 min ago', avatarColor: '#22c55e' },
    { name: 'Alice Johnson', role: 'Rider' as const, message: 'I have a problem with the driver now about finances, he doesn\'t want to drop me off.', timeAgo: '2 min ago', avatarColor: '#8b5cf6' },
  ]);

  readonly mockPayouts = signal([
    { payoutId: 'PO001', driverName: 'Alice Johnson', driverCode: 'P001', totalProfit: 1234.50, appProfit: 120, pendingPayouts: 235, pendingStatus: 'Owed to Driver', payoutsStatus: 'Awaiting Payout', payoutsStatusAmount: '260 CHF', cycleEndDate: '21 Feb. 2026, 10:15 PM' },
    { payoutId: 'PO001', driverName: 'Alice Johnson', driverCode: 'P001', totalProfit: 1234.50, appProfit: 120, pendingPayouts: 235, pendingStatus: 'Owed to Driver', payoutsStatus: 'Awaiting Payout', payoutsStatusAmount: '260 CHF', cycleEndDate: '21 Feb. 2026, 10:15 PM' },
    { payoutId: 'PO001', driverName: 'Alice Johnson', driverCode: 'P001', totalProfit: 1234.50, appProfit: 120, pendingPayouts: 235, pendingStatus: 'Owed to Driver', payoutsStatus: 'Awaiting Payout', payoutsStatusAmount: '260 CHF', cycleEndDate: '21 Feb. 2026, 10:15 PM' },
    { payoutId: 'PO001', driverName: 'Alice Johnson', driverCode: 'P001', totalProfit: 1234.50, appProfit: 120, pendingPayouts: 235, pendingStatus: 'Owed to Driver', payoutsStatus: 'Awaiting Payout', payoutsStatusAmount: '260 CHF', cycleEndDate: '21 Feb. 2026, 10:15 PM' },
    { payoutId: 'PO001', driverName: 'Alice Johnson', driverCode: 'P001', totalProfit: 1234.50, appProfit: 120, pendingPayouts: 235, pendingStatus: 'Owed to Driver', payoutsStatus: 'Awaiting Payout', payoutsStatusAmount: '260 CHF', cycleEndDate: '21 Feb. 2026, 10:15 PM' },
  ]);

  ngOnInit(): void {
    this.getOverView();
    this. getRevenueChart()
  }

  getOverView(): void {

    this.dashboardService.getOverview().subscribe((result) => {
      if (result.isSuccess && result.data) {
        this.overview.set(result.data);
      }
    });
  }


  getRevenueChart(): void {

    this.dashboardService.getRevenueChart(2021).subscribe((result) => {
      if (result.isSuccess && result.data) {
        this.RevenueChart.set(result.data);
      }
    });
  }
}
