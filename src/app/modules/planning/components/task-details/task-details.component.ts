import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { TaskService } from '@svp-api-services';
import { SvpButtonModule, SvpFormInputModule, SvpTaskStatusCardComponent, SvpTypographyModule, SvpUtilityModule } from '@svp-components';
import { PagingRequestModel, Result, StatusCodes, TaskCommentModel, TaskLogModel, TaskModel, TaskStatusEnum, TaskTypeEnum } from '@svp-models';
import { NotificationService } from '@svp-services';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UtcToLocalDatePipe, UtcToTimelinePipe } from '@svp-pipes';
import { FormBuilder, FormsModule } from '@angular/forms';
import { SidePanelRef } from 'src/app/shared/components/side-panel/side-panel-ref';
import { TaskAttachmentComponent } from '../task-attachment/task-attachment.component';
import { TaskDetailService } from '../../services/task-detail.service';

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
  detailService = inject(TaskDetailService);
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

  displayLogs = true;
  logPaging: PagingRequestModel = new PagingRequestModel();
  taskLogs: TaskLogModel[] = [];

  taskComments: TaskCommentModel[] = [];
  commentPaging: PagingRequestModel = new PagingRequestModel();
  commentMessage = '';
  addCommentLoading = false;

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
          this.detailService.loadAttachments(this.task.id);
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

    this.addCommentLoading = true;
    this.taskService.addComment(this.task.id, param).subscribe((res: Result<TaskCommentModel>) => {
      this.addCommentLoading = false;
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
}
