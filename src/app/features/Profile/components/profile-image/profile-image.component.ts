import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService as CoreAuthService } from '../../../../core/services/auth.service';
import { ImageUploadService } from '../../../../core/services/image-upload.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { HotelProfileData, ProfileService } from '../../services/profile.service';
 
@Component({
  selector: 'app-profile-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './profile-image.component.html',
  styleUrl: './profile-image.component.css',
})
export class ProfileImageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileService = inject(ProfileService);
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly notifications = inject(NotificationStore);
  private readonly coreAuth = inject(CoreAuthService);

  protected readonly profile = signal<HotelProfileData | null>(null);
  protected readonly imageSrc = signal('assets/booking/hotel-illustration.png');
  protected readonly uploading = signal(false);

  protected readonly hotelName = computed(() => this.profile()?.hotelName || 'Hotel');
  protected readonly hotelId = computed(() => this.profile()?.id || '');

  constructor() {
    this.loadProfile();
  }

  protected onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || this.uploading()) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => this.imageSrc.set(String(e.target?.result ?? this.imageSrc()));
    reader.readAsDataURL(file);

    this.uploading.set(true);
    this.imageUploadService
      .uploadImage(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (logoUrl) => this.updateProfileImage(logoUrl),
        error: () => {
          this.uploading.set(false);
          this.notifications.showError('Failed to upload image. Please try again.');
          this.resetImagePreview();
        },
      });
  }

  private loadProfile(): void {
    this.profileService
      .getHotelProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.profile.set(result.data);
            this.imageSrc.set(result.data.logoUrl || 'assets/booking/hotel-illustration.png');
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to load hotel profile');
          }
        },
        error: () => {
          this.notifications.showError('Failed to load hotel profile');
        },
      });
  }

  private updateProfileImage(logoUrl: string): void {
    const profile = this.profile();

    if (!profile) {
      this.uploading.set(false);
      this.notifications.showError('Hotel profile is not loaded yet.');
      this.resetImagePreview();
      return;
    }

    this.profileService
      .updateHotelProfile({ ...profile, logoUrl })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.uploading.set(false);

          if (result.isSuccess && result.data) {
            this.profile.set(result.data);
            this.imageSrc.set(result.data.logoUrl || logoUrl);
            this.coreAuth.setProfile({ ...result.data });
            this.notifications.showSuccess('Profile image updated successfully');
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to update profile image');
            this.resetImagePreview();
          }
        },
        error: () => {
          this.uploading.set(false);
          this.notifications.showError('Failed to update profile image');
          this.resetImagePreview();
        },
      });
  }

  private resetImagePreview(): void {
    this.imageSrc.set(this.profile()?.logoUrl || 'assets/booking/hotel-illustration.png');
  }
}
