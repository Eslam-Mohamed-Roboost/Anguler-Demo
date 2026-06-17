import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { BaseComponent } from '../../../../shared/base/base.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { HotelRequestsService, type HotelSummaryItem } from '../../services/hotel-requests.service';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-hotels-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, PaginationComponent, TranslatePipe],
  templateUrl: './hotels-summary.component.html',
  styleUrl: './hotels-summary.component.css',
})
export class HotelsSummaryComponent extends BaseComponent {
  private readonly service = inject(HotelRequestsService);
  private readonly languageService = inject(LanguageService);

  protected readonly hotels = signal<HotelSummaryItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly fromDate = signal('');
  protected readonly toDate = signal('');
  protected readonly searchQuery = signal('');
  protected readonly selectedIds = signal<Set<string>>(new Set());
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly allSelected = computed(() => {
    const ids = this.hotels().map((h) => h.hotelUserId);
    return ids.length > 0 && ids.every((id) => this.selectedIds().has(id));
  });

  protected readonly someSelected = computed(
    () => this.selectedIds().size > 0 && !this.allSelected(),
  );

  protected readonly filteredHotels = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.hotels();
    return this.hotels().filter((h) => h.hotelName.toLowerCase().includes(q));
  });

  protected readonly paginatedHotels = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredHotels().slice(start, start + this.pageSize());
  });

  constructor() {
    super();
    effect(() => {
      this.fromDate();
      this.toDate();
      this.load();
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.selectedIds.set(new Set());
    this.service
      .getHotelsSummary({
        fromDate: this.fromDate() || undefined,
        toDate: this.toDate() || undefined,
      })
      .pipe(this.takeUntilDestroyed())
      .subscribe({
        next: (result) => {
          if (result.isSuccess) this.hotels.set(result.data ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  toggleAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.hotels().map((h) => h.hotelUserId)));
    }
  }

  toggleRow(id: string): void {
    this.selectedIds.update((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  commissionPercent(hotel: HotelSummaryItem): string {
    if (!hotel.totalRevenue) return '--';
    return `${Math.round((hotel.totalHotelEarnings / hotel.totalRevenue) * 100)}%`;
  }

  formatChf(value: number): string {
    return `${value.toFixed(0)} ${this.languageService.translate('currency.chf')}`;
  }

  isSettled(hotel: HotelSummaryItem): boolean {
    return hotel.totalDriverPayouts > 0 && hotel.totalDriverPayouts <= hotel.totalHotelEarnings;
  }
}
