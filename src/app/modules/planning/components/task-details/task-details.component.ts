import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { TaskService } from '@svp-api-services';
import { SvpButtonModule, SvpFormInputModule, SvpTaskStatusCardComponent, SvpTypographyModule, SvpUtilityModule } from '@svp-components';
import { DocumentModel, PagingRequestModel, Result, StatusCodes, TaskCommentModel, TaskLogModel, TaskModel, TaskStatusEnum, TaskTypeEnum } from '@svp-models';
import { NotificationService } from '@svp-services';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UtcToLocalDatePipe, UtcToTimelinePipe } from '@svp-pipes';
import { FormBuilder, FormsModule } from '@angular/forms';
import { SidePanelRef } from 'src/app/shared/components/side-panel/side-panel-ref';
import { TaskAttachmentComponent } from '../task-attachment/task-attachment.component';

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
    SvpTaskStatusCardComponent,
    TaskAttachmentComponent,
  ],
})
export class TaskDetailsComponent implements OnInit {
  @Input({ required: true }) taskId!: number;
  @Output() exit = new EventEmitter();

  taskService = inject(TaskService);
  notify = inject(NotificationService);
  fb = inject(FormBuilder);
  sidePanelRef = inject(SidePanelRef);

  taskTypeEnum = TaskTypeEnum;
  taskStatusEnum = TaskStatusEnum;
  taskTypes = this.taskTypeEnum.asArray;
  taskStatuses = this.taskStatusEnum.asArray;

  loadError: boolean | undefined = undefined;
  errorMessage!: string;
  task!: TaskModel;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments!: any[];
  private deleteQueue: (() => Promise<void>)[] = [];
  private isProcessingQueue = false;

  displayLogs = true;
  logPaging: PagingRequestModel = new PagingRequestModel();
  taskLogs: TaskLogModel[] = [];

  taskComments: TaskCommentModel[] = [];
  commentPaging: PagingRequestModel = new PagingRequestModel();
  commentMessage = '';

  ngOnInit(): void {
    this.getTask();
  }

  getTask(): void {
    this.notify.showLoader();
    this.taskService.getTask(this.taskId).subscribe({
      next: (res: Result<TaskModel>) => {
        this.notify.hideLoader();
        if (res.success) {
          this.task = res.content ?? ({} as TaskModel);
          this.loadError = false;

          // load attachments, logs and comments
          this.loadAttachments();
          this.loadTaskLogs();
          this.loadComments();
        } else {
          this.notify.timedErrorMessage(res.title, res.message);
          this.loadError = true;
        }
      },
      error: async (err: Result<TaskModel>) => {
        this.notify.hideLoader();

        this.errorMessage =
          err.status === StatusCodes.FORBIDDEN ? 'You do not have permission to view this task.' : 'An error occurred while trying to load the task.';
        this.loadError = true;
      },
    });
  }

  loadAttachments(): void {
    this.taskService.listAttachments(this.task.id).subscribe((res: Result<DocumentModel[]>) => {
      if (res.success) {
        this.attachments = res.content ?? [];
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  loadTaskLogs(): void {
    this.taskService.listLogs(this.task.id, this.logPaging).subscribe((res: Result<TaskLogModel[]>) => {
      if (res.success) {
        this.taskLogs = res.content ?? [];
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  loadComments(): void {
    this.taskService.listComments(this.task.id, this.commentPaging).subscribe((res: Result<TaskCommentModel[]>) => {
      if (res.success) {
        this.taskComments = res.content ?? [];
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  addComment(): void {
    if (!this.commentMessage) {
      this.notify.timedErrorMessage('Error', 'Comment cannot be empty');
      return;
    }

    const param = {
      message: this.commentMessage,
    };

    this.taskService.addComment(this.task.id, param).subscribe((res: Result<TaskCommentModel>) => {
      if (res.success) {
        // add new comment to the first of taskComments
        this.commentMessage = '';
        this.taskComments.unshift(res.content ?? ({} as TaskCommentModel));
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  async deleteComment(commentId: number): Promise<void> {
    // confirm action
    const confirmed = await this.notify.confirmDelete();
    if (!confirmed) return;

    this.taskService.removeComment(this.task.id, commentId).subscribe((res: Result<string>) => {
      if (res.success) {
        this.notify.timedSuccessMessage('Comment Deleted', 'Comment has been deleted successfully');
        this.taskComments = this.taskComments.filter(comment => comment.id !== commentId);
      } else {
        this.notify.timedErrorMessage('Unable to delete comment', res.message);
      }
    });
  }

  async deleteAttachment(id: number | undefined, index: number): Promise<void> {
    // Add the deletion request to the queue
    this.deleteQueue.push(() => this.processDeleteAttachment(id, index));

    // Process the queue if not already processing
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.deleteQueue.length > 0) {
      const deleteRequest = this.deleteQueue.shift();
      if (deleteRequest) {
        await deleteRequest();
      }
    }

    this.isProcessingQueue = false;
  }

  private async processDeleteAttachment(id: number | undefined, index: number): Promise<void> {
    // confirm action
    const confirmed = await this.notify.confirmDelete();
    if (!confirmed) return;

    // get the attachment id
    const attachment = this.attachments[index];

    // just remove if the attachment is not yet uploaded
    if (!id || id === 0) {
      this.attachments.splice(index, 1);
      return;
    }

    this.notify.showLoader();
    this.taskService.deleteAttachment(this.task.id, id).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('Attachment Deleted', `${attachment.name} has been deleted successfully`);

        this.attachments.splice(index, 1);
      } else {
        this.notify.errorMessage(`Unable to delete ${attachment.name}`, res.message);
      }
    });
  }

  uploadAttachments(e: Event): void {
    const target = e.target as HTMLInputElement;
    const files = target.files as File[] | null;

    if (files == null) {
      return;
    }

    this.attachments.push(...files);

    // Reset the file input value to allow re-selection of the same file
    target.value = '';
  }
}
