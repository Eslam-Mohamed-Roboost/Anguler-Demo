import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import type * as Highcharts from 'highcharts';

export interface RevenueDataPoint {
  month: string;
  value: number;
}

type MetricType = 'Total Revenue' | 'App Profit' | 'Drivers Profits';
type PeriodType = 'Year' | 'Month' | 'Week';

@Component({
  selector: 'app-revenue-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HighchartsChartComponent],
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.css',
})
export class RevenueChartComponent {
  readonly data = input<RevenueDataPoint[]>([]);

  protected readonly selectedMetric = signal<MetricType>('Total Revenue');
  protected readonly selectedPeriod = signal<PeriodType>('Year');

  protected readonly metrics: MetricType[] = ['Total Revenue', 'App Profit', 'Drivers Profits'];
  protected readonly periods: PeriodType[] = ['Year', 'Month', 'Week'];

  protected readonly metricOpen = signal(false);
  protected readonly periodOpen = signal(false);

  protected readonly chartOptions = computed<Highcharts.Options>(() => {
    const points = this.data();
    const categories = points.map((p) => p.month);
    const values = points.map((p) => p.value);

    return {
      chart: {
        type: 'spline',
        height: 280,
        style: { fontFamily: 'inherit' },
        spacing: [20, 20, 20, 20],
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories,
        lineColor: '#e5e7eb',
        tickLength: 0,
        labels: {
          style: { color: '#9ca3af', fontSize: '12px' },
        },
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: '#f3f4f6',
        labels: { enabled: false },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        borderRadius: 8,
        borderWidth: 0,
        shadow: false,
        style: { color: '#fff', fontSize: '12px' },
        pointFormat: '<b>{point.y:,.0f}</b>',
      },
      plotOptions: {
        spline: {
          lineColor: '#22c55e',
          lineWidth: 2.5,
          marker: {
            enabled: true,
            radius: 5,
            fillColor: '#ffffff',
            lineColor: '#f97316',
            lineWidth: 2.5,
            symbol: 'circle',
          },
          states: {
            hover: {
              lineWidth: 2.5,
            },
          },
        },
      },
      series: [
        {
          type: 'spline' as const,
          name: this.selectedMetric(),
          data: values,
        },
      ],
    };
  });

  toggleMetricOpen(): void {
    this.metricOpen.update((v) => !v);
  }

  togglePeriodOpen(): void {
    this.periodOpen.update((v) => !v);
  }

  selectMetric(metric: MetricType): void {
    this.selectedMetric.set(metric);
    this.metricOpen.set(false);
  }

  selectPeriod(period: PeriodType): void {
    this.selectedPeriod.set(period);
    this.periodOpen.set(false);
  }
}
