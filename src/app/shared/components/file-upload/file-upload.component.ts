/**
 * Drag-and-drop file upload with preview, file type & size validation.
 *
 * Usage:
 *   <app-file-upload
 *     label="Product Image"
 *     inputId="product-img"
 *     accept="image/*"
 *     [maxSizeMb]="5"
 *     (filesChange)="onFiles($event)"
 *   />
 *
 *   <app-file-upload
 *     label="Documents"
 *     inputId="docs"
 *     accept=".pdf,.doc,.docx"
 *     [multiple]="true"
 *     [maxSizeMb]="10"
 *     (filesChange)="onDocs($event)"
 *   />
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export interface UploadedFile {
  file: File;
  previewUrl?: string;
  error?: string;
}

@Component({
  selector: 'app-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent {
  /** Label text */
  readonly label = input('');

  /** Unique HTML id */
  readonly inputId = input.required<string>();

  /** Accepted file types (e.g. "image/*", ".pdf,.doc") */
  readonly accept = input('');

  /** Allow multiple files */
  readonly multiple = input(false);

  /** Max file size in MB (0 = unlimited) */
  readonly maxSizeMb = input(0);

  /** Hint text */
  readonly hint = input('');

  /** Emitted when files change */
  readonly filesChange = output<UploadedFile[]>();

  protected readonly files = signal<UploadedFile[]>([]);
  protected readonly isDragOver = signal(false);

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const fileList = event.dataTransfer?.files;
    if (fileList) this.processFiles(fileList);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  protected onDragLeave(): void {
    this.isDragOver.set(false);
  }

  protected onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
      input.value = ''; // reset so same file can be re-selected
    }
  }

  protected removeFile(index: number): void {
    const updated = [...this.files()];
    const removed = updated.splice(index, 1)[0];
    if (removed?.previewUrl) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    this.files.set(updated);
    this.filesChange.emit(updated);
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  private processFiles(fileList: FileList): void {
    const newFiles: UploadedFile[] = [];
    const maxBytes = this.maxSizeMb() * 1024 * 1024;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let error: string | undefined;

      if (maxBytes > 0 && file.size > maxBytes) {
        error = `File exceeds ${this.maxSizeMb()} MB limit`;
      }

      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;

      newFiles.push({ file, previewUrl, error });
    }

    const updated = this.multiple()
      ? [...this.files(), ...newFiles]
      : newFiles.slice(0, 1);

    this.files.set(updated);
    this.filesChange.emit(updated);
  }
}
