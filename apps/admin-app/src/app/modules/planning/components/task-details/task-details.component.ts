import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { NgSelectModule } from "@ng-select/ng-select";
import { TaskService } from "@svp-api-services";
import { SvpButtonModule, SvpFormInputModule, SvpTaskStatusCardComponent, SvpTypographyModule, SvpUtilityModule } from "@svp-components";
import { DocumentModel, PagingRequestModel, Result, TaskCommentModel, TaskLogModel, TaskModel, TaskStatusEnum, TaskTypeEnum } from "@svp-models";
import { NotificationService } from "@svp-services";
import { AngularSvgIconModule } from "angular-svg-icon";
import { UtcToLocalDatePipe, UtcToTimelinePipe } from "@svp-pipes";
import { environment } from "@svp-environments";
import { FormBuilder, FormsModule } from "@angular/forms";

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AngularSvgIconModule,
    NgSelectModule,
    SvpButtonModule,
    SvpTypographyModule,
    UtcToLocalDatePipe,
    UtcToTimelinePipe,
    SvpUtilityModule,
    SvpFormInputModule,
    SvpTaskStatusCardComponent
  ]
})
export class TaskDetailsComponent implements OnInit {
  taskService = inject(TaskService); 
  notify = inject(NotificationService);
  fb = inject(FormBuilder);

  @Input({required: true}) taskId!: number;
  @Output() exit = new EventEmitter();

  assetBaseUrl = ''; // TODO: environment.assetBaseUrl;
  
  taskTypeEnum = new TaskTypeEnum();
  taskStatusEnum = new TaskStatusEnum();

  taskTypes = this.taskTypeEnum.asArray;
  taskStatuses = this.taskStatusEnum.asArray;
  task!: TaskModel;
  
  attachments!: DocumentModel[];
  displayLogs = true;
  logPaging: PagingRequestModel = new PagingRequestModel();
  taskLogs: TaskLogModel[] = [];

  taskComments: TaskCommentModel[] = [];
  commentPaging: PagingRequestModel = new PagingRequestModel();
  
  // taskComments = [
  //   {
  //     id: 1,
  //     fullName: 'Mordecai Godwin',
  //     message: 'This is a comment and you\'ll write a lot here naturally.',
  //     createdAt: new  Date(2024, 3, 11),
  //   },
  //   {
  //     id: 2,
  //     fullName: 'Mordecai Godwin',
  //     message: 'This is a comment and you\'ll write a lot here naturally.',
  //     createdAt: new Date(2024, 3, 10, 8, 30, 0),
  //   },
  //   {
  //     id: 3,
  //     fullName: 'Mordecai Godwin',
  //     message: 'This is a comment and you\'ll write a lot here naturally.',
  //     createdAt: new Date(2024, 3, 9, 8, 30, 0),
  //   },
  //   {
  //     id: 4,
  //     fullName: 'Mordecai Godwin',
  //     message: 'This is a comment and you\'ll write a lot here naturally.',
  //     createdAt: new Date(2024, 2, 9, 8, 30, 0),
  //   },
  //   {
  //     id: 5,
  //     fullName: 'Mordecai Godwin',
  //     message: 'This is a comment and you\'ll write a lot here naturally.',
  //     createdAt: new Date(2024, 2, 8, 8, 30, 0),
  //   },
  //   {
  //     id: 6,
  //     fullName: 'Mordecai Godwin',
  //     message: 'This is a comment and you\'ll write a lot here naturally.',
  //     createdAt: new Date(2024, 1, 9, 8, 30, 0),
  //   },
  // ]

  commentMessage = '';
  
  ngOnInit(): void {
    console.clear();
    this.getTask(); // TODO: uncomment this line
  }

  getTask(): void {
    this.notify.showLoader();
    this.taskService.getTask(this.taskId)
      .subscribe((res: Result<TaskModel>) => {
        this.notify.hideLoader();
        if (res.success) {
          this.task = res.content ?? {} as TaskModel;
          this.loadAttachments();
          this.loadTaskLogs();
        }
        else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      }
    );
  }

  loadAttachments(): void {
    this.taskService.listAttachments(this.task.id)
      .subscribe((res: Result<DocumentModel[]>) => {
        if (res.success) {
          this.attachments = res.content ?? [];
        }
        else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      });
  }

  loadTaskLogs(): void {
    this.taskService.listLogs(this.task.id, this.logPaging)
      .subscribe((res: Result<TaskLogModel[]>) => {
        if (res.success) {
          this.taskLogs = res.content ?? [];
          console.table(this.taskLogs);
        }
        else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      });
  }

  toggleHistoryOrComments(): void {
    this.displayLogs = !this.displayLogs;
  }
  
  addComment(): void {
    if (!this.commentMessage) {
      this.notify.timedErrorMessage('Error', 'Comment cannot be empty');
      return;
    }

    // TODO: implement API call

    // add new comment to the first of taskComments
    this.taskComments.unshift({
      id: this.taskComments.length + 1,
      fullName: 'Mordecai Godwin',
      message: this.commentMessage,
      createdAt: ''
    });
    this.commentMessage = '';
  }

  async deleteComment(commentId: number): Promise<void> {
    // confirm action
    const confirmed = await this.notify.confirmDelete();
    if (!confirmed) return;

    // TODO: implement API call
    
    this.taskComments = this.taskComments.filter(comment => comment.id !== commentId);
  }

  downloadAttachment(attachmentUrl: string): void {
    window.open(`${this.assetBaseUrl + attachmentUrl}`, '_blank');
  }

  async deleteAttachment(id: number): Promise<void> {
    // confirm action
    const confirmed = await this.notify.confirmDelete();
    if (!confirmed) return;
      
    this.notify.showLoader();
    this.taskService.deleteAttachment(this.task.id, id)
      .subscribe((res: Result<any>) => {
        this.notify.hideLoader();
        if (res.success) {
          // remove attachment from the task
          this.attachments = this.attachments.filter(attachment => attachment.id !== id);
        }
        else {
          this.notify.errorMessage('Unable to remove file', res.message);
        }
      }
    );
  }

  uploadAttachments(e: any): void {
    const files = e.target.files as File[];
    if (files == null) {
      console.log('--> Files is null');
      return;
    }

    // loop through the files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // get file name with extension
      const fileName = file.name;
      const fileType = file.type;

      console.log('==========================')
      console.log('File Data: ', fileName, fileType);

      const newDocument: DocumentModel = {
        id: this.attachments.length + 1,
        name: fileName,
        type: fileType,
        url: '',
        thumbnailUrl: '',
        createdAt: ''
      }

      // add the new document to the task attachments
      this.attachments.push(newDocument);

      this.taskService.uploadFile(this.task.id, file)
        .subscribe((progress: number | undefined) => {
          console.log('Progress: ', progress);
        });
    }    
  }

  trimFileName(fileName: string): string {    
    // get the last substring of the file name as extension
    const extension = fileName.split('.').pop();
    return fileName.length > 17 ? `${fileName.slice(0, 20)}...${extension}` : fileName;
  }
}