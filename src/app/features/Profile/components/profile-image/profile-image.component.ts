import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService as CoreAuthService } from '../../../../core/services/auth.service';
import { ImageUploadService } from '../../../../core/services/image-upload.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { HotelProfileData, ProfileService } from '../../services/profile.service';
 
const DEFAULT_PROFILE_IMAGE = 'assets/booking/logo-lines.png';

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
  protected readonly imageSrc = signal(DEFAULT_PROFILE_IMAGE);
  protected readonly uploading = signal(false);

  protected readonly hotelName = computed(() => this.profile()?.hotelName || 'Hotel');
  protected readonly hotelId = computed(() => this.profile()?.code || '');

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
            this.imageSrc.set(result.data.logoUrl || DEFAULT_PROFILE_IMAGE);
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to load hotel profile');
          }
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
            const updatedProfile = { ...profile, ...result.data, logoUrl: result.data.logoUrl || logoUrl };
            this.profile.set(updatedProfile);
            this.imageSrc.set(updatedProfile.logoUrl || DEFAULT_PROFILE_IMAGE);
            this.coreAuth.setProfile(updatedProfile);
            this.notifications.showSuccess('Profile image updated successfully');
          } else {
            this.notifications.showError(result.error?.description ?? 'Failed to update profile image');
            this.resetImagePreview();
          }
        },
        error: () => {
          this.uploading.set(false);
          this.resetImagePreview();
        },
      });
  }

  private resetImagePreview(): void {
    this.imageSrc.set(this.profile()?.logoUrl || DEFAULT_PROFILE_IMAGE);
  }
}
