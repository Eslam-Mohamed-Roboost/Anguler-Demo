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
import { LanguageService } from '../../../../core/services/language.service';
import { FinancialHistoryService } from '../../services/financial-history.service';
import {
  HotelFinancialItemType,
  type FinancialHistoryBannerItem,
  type FinancialHistoryItem,
  type FinancialHistoryTripItem,
} from '../../models/financialHestory-model';

@Component({
  selector: 'app-financial-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginationComponent, IconComponent, TranslatePipe],
  templateUrl: './financial-history.component.html',
  styleUrl: './financial-history.component.css',
})
export class FinancialHistoryComponent extends BaseComponent {
  private readonly financialHistoryService = inject(FinancialHistoryService);
  private readonly languageService = inject(LanguageService);

  protected readonly items = signal<FinancialHistoryItem[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalItems = signal(0);
  protected readonly loading = signal(false);
  protected readonly globalCommissionLoading = signal(false);
  protected readonly globalCommission = signal<number | null>(null);
  protected readonly searchTerm = signal('');

  protected readonly financialItems = computed(() => this.items());

  protected readonly cumulativeProfits = computed(() => {
    let running = 0;
    return this.financialItems().map((item) => {
      if (!this.isTripItem(item)) return null;
      running += item.platformCommission;
      return item.cumulativeProfit ?? running;
    });
  });

  constructor() {
    super();
    this.loadGlobalCommission();
    effect(() => {
      this.currentPage();
      this.searchTerm();
      this.loadTrips();
    });
  }

  protected loadTrips(): void {
    this.loading.set(true);
    this.financialHistoryService
      .getFinancialHistory({
        pageNumber: this.currentPage(),
        pageSize: this.pageSize(),
        searchTerm: this.searchTerm() || undefined,
      })
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          if (result.isSuccess) {
            this.items.set(result.data?.items ?? []);
            this.totalItems.set(result.data?.totalCount ?? 0);
          }
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
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
    return `${amount.toFixed(2)} ${this.currencyLabel(currency)}`;
  }

  private currencyLabel(currency: string | null | undefined): string {
    return currency?.toUpperCase() === 'CHF'
      ? this.languageService.translate('currency.chf')
      : (currency || '$');
  }

  protected isTripItem(item: FinancialHistoryItem): item is FinancialHistoryTripItem {
    return item.itemType === HotelFinancialItemType.Trip;
  }

  protected isBannerItem(item: FinancialHistoryItem): item is FinancialHistoryBannerItem {
    return item.itemType === HotelFinancialItemType.Banner;
  }

  protected financialItemKey(item: FinancialHistoryItem, index: number): string {
    if (this.isTripItem(item)) {
      return `${item.itemType}-${item.tripId}-${index}`;
    }

    return `${item.itemType}-${item.sequenceDate}-${index}`;
  }

  protected bannerClass(payoutStatus: number): string {
    const baseClass = 'border px-4 py-3 text-center text-xs font-semibold sm:text-sm';

    if (payoutStatus === 2) {
      return `${baseClass} border-blue/30 bg-blue-light text-blue`;
    }

    if (payoutStatus === 3) {
      return `${baseClass} border-status-cancelled/30 bg-status-cancelled-bg text-status-cancelled`;
    }

    return `${baseClass} border-status-scheduled/30 bg-status-scheduled-bg text-status-scheduled`;
  }

  protected bannerCardClass(payoutStatus: number): string {
    return `rounded-lg ${this.bannerClass(payoutStatus)}`;
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
