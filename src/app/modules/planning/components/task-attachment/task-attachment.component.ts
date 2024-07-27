import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { TaskService } from '@svp-api-services';
import { DocumentModel, Result } from '@svp-models';
import { UtcToLocalDatePipe } from '@svp-pipes';
import { NotificationService } from '@svp-services';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UploadProgressModel } from 'src/app/shared/models/api-response-models/upload-progress.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-task-attachment',
  templateUrl: './task-attachment.component.html',
  standalone: true,
  imports: [AngularSvgIconModule, UtcToLocalDatePipe, CommonModule],
})
export class TaskAttachmentComponent implements OnInit {
  @Input({ required: true }) taskId: number = 0;
  @Input() file!: File | DocumentModel;
  /*
  Allow parent component to delete the attachment because 
  some attachments may not have an ID yet
  So it is difficult to remove them from the parent component.
  */
  @Output() requestDelete = new EventEmitter<number | undefined>();

  taskService = inject(TaskService);
  notify = inject(NotificationService);

  assetBaseUrl = environment.assetBaseUrl;
  document: DocumentModel = new DocumentModel();
  uploadProgress = 0;
  uploadStatus: 'uploading' | 'uploaded' | 'failed' = 'uploaded';
  // uploadFailed = false;

  ngOnInit(): void {
    if (this.file instanceof File) {
      this.startFileUpload();
    } else {
      this.document = this.file;
      this.document.thumbnailUrl = this.assetBaseUrl + this.document.thumbnailUrl;
    }
  }

  startFileUpload(): void {
    this.document.name = this.file.name;
    this.document.type = this.file.type;
    this.constructThumbnailFromFile();

    this.uploadStatus = 'uploading';
    this.taskService.uploadFile(this.taskId, this.file as File).subscribe({
      next: (res: UploadProgressModel | Result<DocumentModel>) => {
        // check if res is an instance of UploadProgressModel
        if ((res as UploadProgressModel).progress !== undefined) {
          // update the progress of the file upload
          const progress = (res as UploadProgressModel).progress - 6;
          this.uploadProgress = progress < 0 ? 4 : progress;
        } else {
          const data = (res as Result<DocumentModel>).content;
          this.document.id = data?.id;
          this.document.name = data?.name ?? this.document.name;
          this.document.url = data?.url;
          this.document.thumbnailUrl = this.assetBaseUrl + data?.thumbnailUrl;
          this.document.createdAt = data?.createdAt;
          this.uploadStatus = 'uploaded';

          this.file = this.document;
        }
      },
      error: (error: Result<null>) => {
        this.uploadStatus = 'failed';
        console.error(error);
      },
    });
  }

  downloadAttachment(): void {
    window.open(`${this.assetBaseUrl + this.document.url}`, '_blank');
  }

  get trimmedFileName(): string {
    // get the last substring of the file name as extension
    const fileName = this.document.name ?? '';
    const extension = fileName.split('.').pop();
    return fileName.length > 17 ? `${fileName.slice(0, 18)}...${extension}` : fileName;
  }

  constructThumbnailFromFile() {
    const fileType = this.file.type;

    if (fileType?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = event => {
        this.document.thumbnailUrl = event.target?.result as string;
      };
      reader.readAsDataURL(this.file as File);
    } else {
      // Load default thumbnail based on file type
      switch (fileType) {
        case 'application/pdf':
          this.document.thumbnailUrl = 'assets/images/thumbnails/pdf.png';
          break;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          this.document.thumbnailUrl = 'assets/images/thumbnails/doc.png';
          break;

        // excel or csv
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'text/csv':
          this.document.thumbnailUrl = 'assets/images/thumbnails/excel.png';
          break;
        default:
          this.document.thumbnailUrl = 'assets/images/thumbnails/default.png';
          break;
      }
    }
  }
}
