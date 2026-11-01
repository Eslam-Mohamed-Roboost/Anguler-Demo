import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, of, switchMap } from 'rxjs';
import { AuthService as CoreAuthService } from '../../../../core/services/auth.service';
import { ImageUploadService } from '../../../../core/services/image-upload.service';
import { NotificationStore } from '../../../../core/stores/notification.store';
import { HotelProfileData, ProfileService, toAuthProfileUpdate } from '../../services/profile.service';
 
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

  /** Saves the uploaded image URL on the hotel profile, then re-reads the profile so every view shows the saved logo. */
  private updateProfileImage(logoUrl: string): void {
    if (!logoUrl) {
      this.uploading.set(false);
      this.notifications.showError('Upload did not return an image URL.');
      this.resetImagePreview();
      return;
    }

    const profile$ = this.profile()
      ? of(this.profile()!)
      : this.profileService.getHotelProfile().pipe(map((result) => result.data));

    profile$
      .pipe(
        switchMap((profile) => {
          if (!profile) throw new Error('Hotel profile is not loaded.');
          // PUT /hotels/profile answers with `data: true | false`.
          return this.profileService.updateHotelProfile({ ...profile, logoUrl });
        }),
        switchMap((result) => {
          if (!result.isSuccess || (result.data as unknown) === false) {
            throw new Error(result.error?.description ?? 'Failed to update profile image');
          }
          return this.profileService.getHotelProfile();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.uploading.set(false);
          const saved = result.data;
          if (!saved) return;

          this.profile.set(saved);
          this.imageSrc.set(saved.logoUrl || logoUrl);
          this.coreAuth.setProfile(toAuthProfileUpdate(saved, this.coreAuth.profile()?.configuration));

          if (saved.logoUrl === logoUrl) {
            this.notifications.showSuccess('Profile image updated successfully');
          } else {
            this.notifications.showWarning('Image uploaded, but the server did not save it on the profile.');
          }
        },
        error: (error: unknown) => {
          this.uploading.set(false);
          if (error instanceof Error) this.notifications.showError(error.message);
          this.resetImagePreview();
        },
      });
  }

  private resetImagePreview(): void {
    this.imageSrc.set(this.profile()?.logoUrl || DEFAULT_PROFILE_IMAGE);
  }
}
