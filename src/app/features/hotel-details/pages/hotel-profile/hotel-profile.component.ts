import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CellDefDirective } from '../../../../shared/components/data-table/cell-def.directive';
import type { ColumnDef } from '../../../../shared/components/data-table/column-def';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { HotelInfoCardComponent } from '../../components/hotel-info-card/hotel-info-card.component';
import { StatisticsCardComponent, StatisticItem } from '../../components/statistics-card/statistics-card.component';
import { HotelDetailsFormComponent } from '../../components/hotel-details-form/hotel-details-form.component';
import { WithdrawalDetailsComponent } from '../../components/withdrawal-details/withdrawal-details.component';
import type { HotelFormData, HotelInfo, TripRecord, WithdrawalFormData } from '../../types/hotel-details.types';

@Component({
  selector: 'app-hotel-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    CardComponent,
    IconComponent,
    DataTableComponent,
    CellDefDirective,
    HotelInfoCardComponent,
    StatisticsCardComponent,
    HotelDetailsFormComponent,
    WithdrawalDetailsComponent,
  ],
  templateUrl: './hotel-profile.component.html',
  styleUrl: './hotel-profile.component.css',
})
export class HotelProfileComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly renderer = inject(Renderer2);

  readonly hotelId = signal('');
  readonly searchQuery = signal('');
  readonly awaitingAmount = signal(280);

  readonly hotel = signal<HotelInfo>({
    id: '1',
    name: 'Massa Hotel',
    address: '12 Faxy st. Jadida Sqatine, Egypt.',
    phone: '00201235565489',
    email: 'hello@gmail.com',
    imageUrl: '',
  });

  readonly statistics = signal<StatisticItem[]>([
    { label: 'Commi. Percentage (%)', value: '2%', color: 'orange' },
    { label: 'Hotel Balance', value: '89,456 CHF', color: 'orange' },
    { label: 'Hotels Commi.', value: '10,456 CHF', color: 'orange' },
    { label: 'Lines Net Profit', value: '20,456 CHF', color: 'orange' },
    { label: 'Active Trips', value: '120', color: 'orange' },
    { label: 'Scheduled Trips', value: '15', color: 'orange' },
    { label: 'Completed Trips', value: '15', color: 'orange' },
    { label: 'Cancelled Trips', value: '40', color: 'orange' },
  ]);

  readonly allTrips = signal<TripRecord[]>([
    this.mockTrip('scheduled'),
    this.mockTrip('active'),
    this.mockTrip('cancelled'),
    this.mockTrip('pending'),
    this.mockTrip('completed'),
    this.mockTrip('scheduled'),
    this.mockTrip('completed'),
    this.mockTrip('completed'),
    this.mockTrip('completed'),
    this.mockTrip('completed'),
  ]);

  readonly filteredTrips = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.allTrips();
    return this.allTrips().filter(t =>
      t.customerName.toLowerCase().includes(q) ||
      t.driverName?.toLowerCase().includes(q) ||
      t.pickupLocation.toLowerCase().includes(q) ||
      t.dropoffLocation.toLowerCase().includes(q),
    );
  });

  protected readonly columns = computed<ColumnDef[]>(() => [
    { key: 'id', header: 'Trip ID', sortable: true, headerClass: 'w-20' },
    { key: 'guest', header: 'Guest', sortable: true, headerClass: 'w-32' },
    { key: 'driver', header: 'Driver', sortable: true, headerClass: 'w-32' },
    { key: 'route', header: 'Route', sortable: false, headerClass: 'w-40' },
    { key: 'duration', header: 'Duration', sortable: true, headerClass: 'w-24' },
    { key: 'fare', header: 'Fare', sortable: true, headerClass: 'w-24' },
    { key: 'date', header: 'Date', sortable: true, headerClass: 'w-32' },
    { key: 'actions', header: 'Actions', sortable: false, headerClass: 'w-16' },
  ]);

  protected readonly tripStatusColorMap: Record<string, string> = {
    completed: 'status-completed',
    active: 'status-active',
    pending: 'status-pending',
    scheduled: 'status-scheduled',
    cancelled: 'status-cancelled',
  };

  private mockTrip(status: TripRecord['status']): TripRecord {
    return {
      id: 'TR001',
      customerName: 'Alice Johnson',
      pickupLocation: 'Hotel District A',
      dropoffLocation: 'Airport',
      date: '2024-01-15T14:30:00Z',
      endDate: status === 'active' || status === 'scheduled' ? undefined : '2024-01-15T15:00:00Z',
      status,
      price: 18.50,
      currency: 'CHF',
      distance: 12.5,
      duration: 25,
      paymentStatus: 'Paid',
      driverName: 'Ahmed Johnson',
      driverId: 'P45263',
      room: 'Room 24',
      commission: 3.70,
    };
  }

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'hotel-details-active');
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.hotelId.set(id);
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'hotel-details-active');
  }

  protected onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '--';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(dateStr));
  }

  onFormSubmit(_data: HotelFormData): void {}
  onFormCancel(): void {}
  onWithdrawalSubmit(_data: WithdrawalFormData): void {}
  onHotelDelete(): void {}
}
