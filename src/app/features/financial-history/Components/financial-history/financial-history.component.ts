import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { BaseComponent } from '../../../../shared/base/base.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { FinancialHistoryService } from '../../services/financial-history.service';
import type { FinancialHistoryItem } from '../../models/financialHestory-model';
import type { SortState } from '../../../../shared/components/data-table/column-def';

@Component({
  selector: 'app-financial-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginationComponent, IconComponent, TranslatePipe],
  templateUrl: './financial-history.component.html',
  styleUrl: './financial-history.component.css',
})
export class FinancialHistoryComponent extends BaseComponent {
  private readonly financialHistoryService = inject(FinancialHistoryService);

  protected readonly sortState = signal<SortState>({ column: '', direction: null });
  protected readonly trips = signal<FinancialHistoryItem[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalItems = signal(0);
  protected readonly loading = signal(false);
  protected readonly globalCommissionLoading = signal(false);
  protected readonly globalCommission = signal<number | null>(null);
  protected readonly fromDate = signal('');
  protected readonly toDate = signal('');

  protected readonly sortedTrips = computed(() => {
    const { column, direction } = this.sortState();
    if (!column || !direction) return this.trips();
    return [...this.trips()].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[column];
      const bVal = (b as unknown as Record<string, unknown>)[column];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  });

  protected readonly cumulativeProfits = computed(() => {
    let running = 0;
    return this.sortedTrips().map((trip) => {
      running += trip.platformCommission;
      return running;
    });
  });

  constructor() {
    super();
    this.loadGlobalCommission();
    effect(() => {
      this.currentPage();
      this.fromDate();
      this.toDate();
      this.loadTrips();
    });
  }

  protected loadTrips(): void {
    this.loading.set(true);
    this.financialHistoryService
      .getFinancialHistory({
        pageNumber: this.currentPage(),
        pageSize: this.pageSize(),
        fromDate: this.fromDate() || undefined,
        toDate: this.toDate() || undefined,
      })
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.trips.set(result.data?.items ?? []);
            this.totalItems.set(result.data?.totalCount ?? 0);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onSort(state: SortState): void {
    this.sortState.set(state);
    this.currentPage.set(1);
  }

  clearSort(): void {
    this.sortState.set({ column: '', direction: null });
  }

  onFromDateChange(date: string): void {
    this.fromDate.set(date);
    this.currentPage.set(1);
  }

  onToDateChange(date: string): void {
    this.toDate.set(date);
    this.currentPage.set(1);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  formatCurrency(amount: number | null | undefined, currency: string): string {
    if (amount == null) return '--';
    return currency ? `${amount.toFixed(2)} ${currency}` : `$${amount.toFixed(2)}`;
  }

  private loadGlobalCommission(): void {
    this.globalCommissionLoading.set(true);
    this.financialHistoryService
      .getGlobalCommission()
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          this.globalCommissionLoading.set(false);
          if (result.isSuccess && result.data !== null) {
            this.globalCommission.set(result.data);
          }
        },
        error: () => {
          this.globalCommissionLoading.set(false);
        },
      });
  }
}
