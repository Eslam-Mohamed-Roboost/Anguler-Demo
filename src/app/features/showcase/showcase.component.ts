/**
 * Comprehensive showcase / kitchen-sink page demonstrating every shared
 * component, directive, pipe, and service in the project.
 */
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { form, required } from '@angular/forms/signals';
import type { SchemaPathTree } from '@angular/forms/signals';

// ── Shared components ──────────────────────────────────────
import { TabsComponent } from '../../shared/components/tabs/tabs.component';
import type { TabDef } from '../../shared/components/tabs/tabs.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BtnComponent } from '../../shared/components/btn/btn.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { TimelineComponent } from '../../shared/components/timeline/timeline.component';
import type { TimelineItem } from '../../shared/components/timeline/timeline.component';
import { StepperComponent } from '../../shared/components/stepper/stepper.component';
import type { StepDef } from '../../shared/components/stepper/stepper.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { CheckboxComponent } from '../../shared/components/checkbox/checkbox.component';
import { RadioGroupComponent } from '../../shared/components/radio-group/radio-group.component';
import { TagInputComponent } from '../../shared/components/tag-input/tag-input.component';
import { DatePickerComponent } from '../../shared/components/date-picker/date-picker.component';
import { FileUploadComponent } from '../../shared/components/file-upload/file-upload.component';
import { FormGroupComponent } from '../../shared/components/form-group/form-group.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import {
  DataTableComponent,
  CellDefDirective,
} from '../../shared/components/data-table/data-table.component';
import type { ColumnDef, SortState } from '../../shared/components/data-table/column-def';
import { DropdownMenuComponent } from '../../shared/components/dropdown-menu/dropdown-menu.component';
import { DropdownItemComponent } from '../../shared/components/dropdown-menu/dropdown-item.component';
import { DropdownDividerComponent } from '../../shared/components/dropdown-menu/dropdown-divider.component';
import { ImageComponent } from '../../shared/components/image/image.component';
import { AccordionComponent } from '../../shared/components/accordion/accordion.component';
import type { AccordionItem } from '../../shared/components/accordion/accordion.component';
import { ImageSliderComponent } from '../../shared/components/image-slider/image-slider.component';
import type { SlideItem } from '../../shared/components/image-slider/image-slider.component';
import { SwitchToggleComponent } from '../../shared/components/switch-toggle/switch-toggle.component';
import { PasswordInputComponent } from '../../shared/components/password-input/password-input.component';
import { SliderComponent } from '../../shared/components/slider/slider.component';
import { RatingComponent } from '../../shared/components/rating/rating.component';

// ── Shared directives ──────────────────────────────────────
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { ClickOutsideDirective } from '../../shared/directives/click-outside.directive';
import { SkeletonDirective } from '../../shared/directives/skeleton.directive';
import { CopyToClipboardDirective } from '../../shared/directives/copy-to-clipboard.directive';

// ── Shared utilities ───────────────────────────────────────
import { localStorageSignal } from '../../shared/utils/local-storage-signal';

// ── Shared pipes ───────────────────────────────────────────
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { InitialsPipe } from '../../shared/pipes/initials.pipe';

// ── Core services ──────────────────────────────────────────
import { NotificationStore } from '../../core/stores/notification.store';
import { ConfirmDialogService } from '../../shared/components/confirm-dialog/confirm-dialog.service';
import { LoggerService } from '../../core/services/logger.service';
import { FeatureFlagService } from '../../core/services/feature-flag.service';

/* ── Demo form model ──────────────────────────────────────── */
interface DemoFormModel {
  text: string;
  email: string;
  textarea: string;
  numNative: number;
  numCustom: number;
  numNone: number;
  selectNative: string;
  selectCustom: string;
  selectNone: string;
  checkbox1: boolean;
  checkbox2: boolean;
  radioVertical: string;
  radioHorizontal: string;
  date: string;
  dateSuccess: string;
  dateDanger: string;
  hidden: string;
  switch1: boolean;
  switch2: boolean;
  password: string;
}

@Component({
  selector: 'app-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TabsComponent,
    CardComponent,
    BtnComponent,
    IconComponent,
    BadgeComponent,
    AvatarComponent,
    ProgressBarComponent,
    TimelineComponent,
    StepperComponent,
    EmptyStateComponent,
    ModalComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    RadioGroupComponent,
    TagInputComponent,
    DatePickerComponent,
    FileUploadComponent,
    FormGroupComponent,
    SearchInputComponent,
    PaginationComponent,
    DataTableComponent,
    CellDefDirective,
    DropdownMenuComponent,
    DropdownItemComponent,
    DropdownDividerComponent,
    ImageComponent,
    AccordionComponent,
    ImageSliderComponent,
    SwitchToggleComponent,
    PasswordInputComponent,
    SliderComponent,
    RatingComponent,
    TooltipDirective,
    ClickOutsideDirective,
    SkeletonDirective,
    CopyToClipboardDirective,
    TruncatePipe,
    RelativeTimePipe,
    FileSizePipe,
    InitialsPipe,
  ],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.css',
})
export class ShowcaseComponent {
  private readonly notifications = inject(NotificationStore);
  private readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly logger = inject(LoggerService);
  protected readonly featureFlags = inject(FeatureFlagService);

  /* ── Tab navigation ────────────────────────────────────── */
  readonly tabs: TabDef[] = [
    { key: 'forms', label: 'Form Controls', icon: 'edit' },
    { key: 'ui', label: 'UI Components', icon: 'layers' },
    { key: 'data', label: 'Data Display', icon: 'filter' },
    { key: 'feedback', label: 'Feedback', icon: 'alert-triangle' },
    { key: 'pipes', label: 'Pipes & Directives', icon: 'package' },
  ];
  readonly activeTab = signal('forms');

  /* ── Demo Signal Form ──────────────────────────────────── */
  protected readonly formModel = signal<DemoFormModel>({
    text: '',
    email: '',
    textarea: '',
    numNative: 0,
    numCustom: 0,
    numNone: 0,
    selectNative: '',
    selectCustom: '',
    selectNone: '',
    checkbox1: false,
    checkbox2: false,
    radioVertical: '',
    radioHorizontal: '',
    date: '',
    dateSuccess: '',
    dateDanger: '',
    hidden: '',
    switch1: true,
    switch2: false,
    password: '',
  });
  protected readonly f = form(this.formModel, (s: SchemaPathTree<DemoFormModel>) => {
    required(s.text);
    required(s.email);
  });

  /* ── Modal ─────────────────────────────────────────────── */
  readonly modalOpen = signal(false);

  /* ── Stepper ───────────────────────────────────────────── */
  readonly stepDefs: StepDef[] = [
    { key: 'account', label: 'Account' },
    { key: 'profile', label: 'Profile' },
    { key: 'settings', label: 'Settings', optional: true },
    { key: 'review', label: 'Review' },
  ];
  readonly activeStep = signal('account');

  /* ── Progress ──────────────────────────────────────────── */
  readonly progress = signal(45);

  /* ── Tag Input ─────────────────────────────────────────── */
  readonly tags = signal<string[]>(['Angular', 'TypeScript']);

  /* ── Timeline ──────────────────────────────────────────── */
  readonly timelineItems: TimelineItem[] = [
    { title: 'Project created', description: 'Repository initialized with Angular CLI', time: '3 days ago', icon: 'plus', variant: 'success' },
    { title: 'Architecture designed', description: 'Core, Shared, Features layers established', time: '2 days ago', icon: 'layers', variant: 'primary' },
    { title: 'Components built', description: '30+ shared components created', time: 'yesterday', icon: 'package', variant: 'primary' },
    { title: 'Showcase added', description: 'This demo page was created', time: 'just now', icon: 'eye', variant: 'success' },
  ];

  /* ── Accordion ────────────────────────────────────────── */
  readonly accordionFaq: AccordionItem[] = [
    { key: 'q1', title: 'What is Angular?', content: 'Angular is a TypeScript-based web application framework led by the Angular Team at Google. It provides a comprehensive solution for building single-page applications with features like dependency injection, routing, forms, and HTTP client.', icon: 'info', expanded: true },
    { key: 'q2', title: 'What is Tailwind CSS?', content: 'Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in your markup. Instead of pre-built components, you compose designs using small, single-purpose classes.', icon: 'layers' },
    { key: 'q3', title: 'What are Angular Signals?', content: 'Signals are a reactive primitive introduced in Angular that provide a way to express reactive state. They notify interested consumers when they change, enabling fine-grained reactivity without relying on Zone.js.', icon: 'check-circle' },
    { key: 'q4', title: 'How does SSR work?', content: 'Server-Side Rendering (SSR) in Angular uses Angular Universal to render the application on the server, sending fully rendered HTML to the browser. This improves initial load time, SEO, and perceived performance.', icon: 'shield' },
    { key: 'q5', title: 'Disabled Panel', content: 'This content should not be visible.', disabled: true },
  ];

  /* ── Image Slider ─────────────────────────────────────── */
  readonly demoSlides: SlideItem[] = [
    { src: 'https://picsum.photos/id/1018/800/400', alt: 'Mountain landscape', caption: 'Majestic mountain peaks at sunrise' },
    { src: 'https://picsum.photos/id/1015/800/400', alt: 'River through forest', caption: 'Peaceful river winding through the forest' },
    { src: 'https://picsum.photos/id/1019/800/400', alt: 'Rocky coastline', caption: 'Dramatic rocky coastline at sunset' },
    { src: 'https://picsum.photos/id/1039/800/400', alt: 'Misty hills', caption: 'Rolling hills blanketed in morning mist' },
    { src: 'https://picsum.photos/id/1043/800/400', alt: 'City skyline', caption: 'Modern city skyline reflected on water' },
  ];

  /* ── Data Table ────────────────────────────────────────── */
  readonly tableColumns: ColumnDef[] = [
    { key: 'id', header: '#', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role' },
    { key: 'actions', header: 'Actions' },
  ];

  private readonly allTableData = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
    { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer' },
    { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Editor' },
    { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin' },
    { id: 6, name: 'Frank Wilson', email: 'frank@example.com', role: 'Viewer' },
  ];
  readonly tableData = signal([...this.allTableData]);
  readonly tablePage = signal(1);
  readonly searchQuery = signal('');
  readonly filteredTableData = signal([...this.allTableData]);

  readonly categories = ['Electronics', 'Clothing', 'Food', 'Books'] as const;
  readonly radioOptionsV = ['Option A', 'Option B', 'Option C'] as const;
  readonly radioOptionsH = ['Small', 'Medium', 'Large'] as const;
  readonly clickOutsideCount = signal(0);

  /* ── Slider ──────────────────────────────────────────────── */
  readonly sliderValue = signal(50);

  /* ── Rating ──────────────────────────────────────────────── */
  readonly ratingValue = signal(3);
  readonly ratingReadonly = signal(4);

  /* ── Skeleton directive demo ────────────────────────────── */
  readonly skeletonLoading = signal(true);

  /* ── Copy-to-clipboard demo ─────────────────────────────── */
  readonly copyText = 'c7d2e14a-b1a3-4f5e-8c9d-0e1f2a3b4c5d';

  /* ── LocalStorageSignal demo ────────────────────────────── */
  readonly storedCounter = localStorageSignal<number>('showcase-counter', 0);

  /* ── Feature Flags demo ──────────────────────────────────── */
  readonly demoFlags: { name: string; description: string }[] = [
    { name: 'new-dashboard', description: 'Enable the redesigned dashboard' },
    { name: 'dark-mode-v2', description: 'Use improved dark mode colors' },
    { name: 'experimental-search', description: 'AI-powered search suggestions' },
    { name: 'beta-export', description: 'CSV/PDF export functionality' },
  ];

  constructor() {
    this.featureFlags.registerDefaults({
      'new-dashboard': false,
      'dark-mode-v2': true,
      'experimental-search': false,
      'beta-export': false,
    });
  }

  /* ── Pipes demo data ───────────────────────────────────── */
  readonly longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
  readonly pastDate = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
  readonly fileBytes = 2_457_600; // ~2.3 MB

  /* ── Handlers ──────────────────────────────────────────── */

  showToast(type: 'success' | 'error' | 'warning' | 'info'): void {
    const messages: Record<string, string> = {
      success: 'Operation completed successfully!',
      error: 'Something went wrong. Please try again.',
      warning: 'This action may have side effects.',
      info: 'Here is some useful information.',
    };
    this.notifications.show(type, messages[type]);
  }

  async showConfirm(): Promise<void> {
    const result = await this.confirmDialog.confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed with this action? This is a demo of the confirm dialog.',
      confirmLabel: 'Proceed',
      cancelLabel: 'Cancel',
      confirmVariant: 'danger',
    });
    this.notifications.showInfo(result ? 'You confirmed the action.' : 'You cancelled the action.');
  }

  onSort(state: SortState): void {
    this.logger.info('Sort changed', state);
    if (!state.direction) {
      this.filteredTableData.set([...this.allTableData]);
      return;
    }
    const sorted = [...this.allTableData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[state.column];
      const bVal = (b as Record<string, unknown>)[state.column];
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return state.direction === 'asc' ? cmp : -cmp;
    });
    this.filteredTableData.set(sorted);
  }

  onTableSearch(query: string): void {
    this.searchQuery.set(query);
    const q = query.toLowerCase();
    if (!q) {
      this.filteredTableData.set([...this.allTableData]);
      return;
    }
    this.filteredTableData.set(
      this.allTableData.filter(
        (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
      ),
    );
  }

  logAction(action: string): void {
    this.logger.info('Dropdown action', action);
    this.notifications.showInfo(`Action: ${action}`);
  }

  incrementProgress(): void {
    this.progress.update((v) => Math.min(100, v + 10));
  }

  decrementProgress(): void {
    this.progress.update((v) => Math.max(0, v - 10));
  }

  toggleSkeletonLoading(): void {
    this.skeletonLoading.update((v) => !v);
  }

  incrementCounter(): void {
    this.storedCounter.update((v) => v + 1);
  }

  resetCounter(): void {
    this.storedCounter.set(0);
  }

  onClickOutside(): void {
    this.clickOutsideCount.update((v) => v + 1);
  }

  logError(): void {
    this.logger.error('Error message', new Error('Test'));
  }
}
