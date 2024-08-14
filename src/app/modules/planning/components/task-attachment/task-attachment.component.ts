import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { VideoUploader } from '@api.video/video-uploader';
import { TaskService } from '@svp-api-services';
import { DocumentModel, Result } from '@svp-models';
import { UtcToLocalDatePipe } from '@svp-pipes';
import { NotificationService } from '@svp-services';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { VideoUploadTokenModel } from 'src/app/shared/models/api-response-models/task/video-upload-token.model';
import { UploadProgressModel } from 'src/app/shared/models/api-response-models/upload-progress.model';
import { environment } from 'src/environments/environment';
import { FileToUploadModel, TaskDetailService } from '../../services/task-detail.service';

@Component({
  selector: 'app-task-attachment',
  templateUrl: './task-attachment.component.html',
  standalone: true,
  imports: [AngularSvgIconModule, UtcToLocalDatePipe, CommonModule],
})
export class TaskAttachmentComponent implements OnInit, OnDestroy {
  @Input({ required: true }) taskId: number = 0;
  @Input() inputFile!: FileToUploadModel | DocumentModel;

  taskService = inject(TaskService);
  notify = inject(NotificationService);
  detailService = inject(TaskDetailService);

  document: DocumentModel = new DocumentModel();
  uploadProgress = 0;
  uploadStatus: 'uploading' | 'uploaded' | 'failed' = 'uploaded';
  videoUploader!: VideoUploader | undefined;
  videoEncoding = false;
  showVideoPlayer = false;
  videoPlayingUrl: string | undefined = undefined;

  ngOnInit(): void {
    if (this.inputFile instanceof File) {
      this.startFileUpload();
    } else {
      this.document = this.inputFile;
    }
  }

  startFileUpload(): void {
    const fileType = this.inputFile.type;

    // if file is a video
    if (fileType?.startsWith('video/')) {
      this.uploadAsVideo();
    } else {
      this.uploadAsOtherTypes();
    }
  }

  uploadAsOtherTypes(): void {
    this.document.name = this.inputFile.name;
    this.document.type = this.inputFile.type;
    this.constructThumbnailFromFile();

    this.uploadStatus = 'uploading';
    this.taskService.uploadFile(this.taskId, this.inputFile as File).subscribe({
      next: (res: UploadProgressModel | Result<DocumentModel>) => {
        // check if res is an instance of UploadProgressModel
        if ((res as UploadProgressModel).progress !== undefined) {
          // update the progress of the file upload
          const progress = (res as UploadProgressModel).progress - 6;
          this.uploadProgress = progress < 0 ? 4 : progress;
        } else {
          const data = (res as Result<DocumentModel>).content;

          this.setNewDocumentData(data as DocumentModel);
        }
      },
      error: (error: Result<null>) => {
        this.uploadStatus = 'failed';
        console.error(error);
      },
    });
  }

  uploadAsVideo(): void {
    this.document.name = this.inputFile.name;
    this.constructThumbnailFromFile();

    this.uploadStatus = 'uploading';
    this.taskService.getVideoUploadToken().subscribe({
      next: (res: Result<VideoUploadTokenModel>) => {
        if (!res.success) {
          this.uploadStatus = 'failed';
          this.notify.errorMessage('Error', res.message);
          return;
        }

        // create a video uploader instance
        this.videoUploader = new VideoUploader({
          file: this.inputFile as File,
          uploadToken: res.content?.token ?? '',
          chunkSize: 1024 * 1024 * 5, // 5MB
          retries: 10,
          apiHost: environment.apiVideoUrl,
        });

        // update progress
        this.videoUploader.onProgress(event => {
          const progress = Math.floor((event.uploadedBytes / event.totalBytes) * 100) - 6;
          this.uploadProgress = progress < 0 ? 0 : progress;
        });

        // save video data to the server
        this.videoUploader.onPlayable(video => {
          this.taskService.saveVideoAttachment(this.taskId, video).subscribe({
            next: (res: Result<DocumentModel>) => {
              if (res.success) {
                this.setNewDocumentData(res.content as DocumentModel);
              } else {
                this.uploadStatus = 'failed';
                this.notify.errorMessage('Error', res.message);
              }
            },
            error: (error: Result<null>) => {
              this.uploadStatus = 'failed';
              console.error(error);
            },
          });
        });

        // save video data
        this.videoUploader.upload().then(() => {
          this.videoEncoding = true;
        });
      },
      error: (error: Result<null>) => {
        this.uploadStatus = 'failed';
        console.error(error);
      },
    });
  }

  cancelVideoUpload(): void {
    if (this.videoUploader) {
      this.videoUploader.cancel();
      this.videoUploader = undefined;
    }

    this.detailService.deleteAttachment(this.inputFile, true);
  }

  setNewDocumentData(data: DocumentModel): void {
    const doc: DocumentModel = {
      id: data.id,
      name: data.name,
      type: data.type,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      createdAt: data.createdAt,
      localUid: this.inputFile.localUid,
    };

    this.uploadStatus = 'uploaded';
    this.detailService.updateAttachmentReference(doc);
    this.inputFile = this.document = doc;
  }

  downloadAttachment(): void {
    window.open(this.document.url, '_blank');
  }

  playVideo(): void {
    if (this.document.type !== 'Video') return;

    this.showVideoPlayer = true;
    this.videoPlayingUrl = this.document.url;
  }

  closeVideoPlayer(): void {
    this.showVideoPlayer = false;
    this.videoPlayingUrl = undefined;
  }

  get trimmedFileName(): string {
    // get the last substring of the file name as extension
    const fileName = this.document.name ?? '';
    const extension = fileName.split('.').pop();
    return fileName.length > 17 ? `${fileName.slice(0, 18)}...${extension}` : fileName;
  }

  constructThumbnailFromFile() {
    const fileType = this.inputFile.type;

    if (fileType?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = event => {
        this.document.thumbnailUrl = event.target?.result as string;
      };
      reader.readAsDataURL(this.inputFile as File);
    } else {
      // Load default thumbnail based on file type
      switch (fileType) {
        case 'video/mp4':
          this.document.thumbnailUrl = 'assets/images/thumbnails/video.png';
          break;
        case 'application/pdf':
          this.document.thumbnailUrl = 'assets/images/thumbnails/pdf.png';
          break;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          this.document.thumbnailUrl = 'assets/images/thumbnails/doc.png';
          break;
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

  ngOnDestroy(): void {
    if (this.videoUploader) {
      this.videoUploader.cancel();
      this.videoUploader = undefined;
    }
  }
}
