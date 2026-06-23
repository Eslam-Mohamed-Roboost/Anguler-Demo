import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import type * as Highcharts from 'highcharts';
import { ThemeService } from '../../../../core/services/theme.service';

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
  private readonly themeService = inject(ThemeService);

  readonly data = input<RevenueDataPoint[]>([]);

  protected readonly selectedMetric = signal<MetricType>('Total Revenue');
  protected readonly selectedPeriod = signal<PeriodType>('Year');

  protected readonly metrics: MetricType[] = ['Total Revenue', 'App Profit', 'Drivers Profits'];
  protected readonly periods: PeriodType[] = ['Year', 'Month', 'Week'];

  protected readonly metricOpen = signal(false);
  protected readonly periodOpen = signal(false);

  /** Chart palette that follows the app light/dark theme. */
  private readonly palette = computed(() => {
    const dark = this.themeService.isDark();
    return {
      axisLine: dark ? '#26313A' : '#E1E7EF',
      labels: dark ? '#A9B4BE' : '#5B738B',
      gridLine: dark ? '#202A33' : '#EDF1F5',
      tooltipBg: dark ? '#1D232A' : '#12171C',
      tooltipText: '#FFFFFF',
      line: '#00A63E',
      markerFill: dark ? '#161B21' : '#FFFFFF',
      markerLine: '#E76500',
    };
  });

  protected readonly chartOptions = computed<Highcharts.Options>(() => {
    const points = this.data();
    const categories = points.map((p) => p.month);
    const values = points.map((p) => p.value);
    const colors = this.palette();

    return {
      chart: {
        type: 'spline',
        height: 280,
        backgroundColor: 'transparent',
        style: { fontFamily: 'inherit' },
        spacing: [20, 20, 20, 20],
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories,
        lineColor: colors.axisLine,
        tickLength: 0,
        labels: {
          style: { color: colors.labels, fontSize: '12px' },
        },
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: colors.gridLine,
        labels: { enabled: false },
      },
      tooltip: {
        backgroundColor: colors.tooltipBg,
        borderRadius: 8,
        borderWidth: 0,
        shadow: false,
        style: { color: colors.tooltipText, fontSize: '12px' },
        pointFormat: '<b>{point.y:,.0f}</b>',
      },
      plotOptions: {
        spline: {
          lineColor: colors.line,
          lineWidth: 2.5,
          marker: {
            enabled: true,
            radius: 5,
            fillColor: colors.markerFill,
            lineColor: colors.markerLine,
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
