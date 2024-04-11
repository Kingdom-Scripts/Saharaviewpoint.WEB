import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { NgSelectModule } from "@ng-select/ng-select";
import { TaskService } from "@svp-api-services";
import { SvpButtonModule, SvpFormInputModule, SvpTaskStatusCardComponent, SvpTypographyModule, SvpUtilityModule } from "@svp-components";
import { DocumentModel, Result, TaskModel, TaskStatusEnum, TaskTypeEnum } from "@svp-models";
import { NotificationService } from "@svp-services";
import { AngularSvgIconModule } from "angular-svg-icon";
import { UtcToLocalDatePipe, UtcToTimelinePipe } from "@svp-pipes";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { environment } from "libs/shared/environments/environment";
import { FormBuilder, FormGroup, FormsModule } from "@angular/forms";

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

  assetBaseUrl = '' ; // environment.assetBaseUrl; // TODO: fix this
  
  taskTypeEnum = new TaskTypeEnum();
  taskStatusEnum = new TaskStatusEnum();

  taskTypes = this.taskTypeEnum.asArray;
  taskStatuses = this.taskStatusEnum.asArray;
  // task!: TaskModel;
  
  task: TaskModel = {
    "createdById": 6,
    "project": {
        "id": 12,
        "title": "5 Block of Flats",
        'description': '',
        "status": "In Progress",
        "startDate": new Date(),
        "dueDate": new Date(),
        "isPriority": false,
        "order": 0,
        "assignee": {
            "id": 9,
            "firstName": "Mordecai",
            "lastName": "Project Manager"
        },
        "createdBy": {
            "id": 3,
            "firstName": "John",
            "lastName": "Doe"
        }
    },
    "createdBy": {
        "id": 6,
        "firstName": "Mordecai",
        "lastName": "Godwin - Admin"
    },
    "attachments": [
        {
            "id": 17,
            "name": "free-file-icon-1453-thumb.png",
            "type": "Image",
            "url": "f07aa6d8-31f3-4253-909d-956db5dc94b2/5-block-of-flats/bac6751d-97e3-47a7-9f6e-456799eb9d77.png",
            "thumbnailUrl": "f07aa6d8-31f3-4253-909d-956db5dc94b2/5-block-of-flats/_thumbnail/bac6751d-97e3-47a7-9f6e-456799eb9d77.png",
            createdAt: new Date()
        },
        {
            "id": 18,
            "name": "red minimalist Valentine's Day Dinner Menu (Instagram Post)(1).png",
            "type": "Image",
            "url": "f07aa6d8-31f3-4253-909d-956db5dc94b2/5-block-of-flats/03a55e0f-0f5e-4288-8ced-da604ec100ed.png",
            "thumbnailUrl": "f07aa6d8-31f3-4253-909d-956db5dc94b2/5-block-of-flats/_thumbnail/03a55e0f-0f5e-4288-8ced-da604ec100ed.png",
            createdAt: new Date()
        }
    ],
    "id": 5,
    "projectId": 12,
    "type": "Task",
    "status": "TO DO",
    "summary": "Set up a background job to delete every transaction that is done in the TransactionQueue table every 1st of the month.",
    "description": "This is a description and you'll write a lot here naturally.",
    "createdAt": new Date(),
    "expectedStartDate": new Date(),
    "dueDate": new Date(),
    "order": 0
  };

  displayHistory = true;
  taskHistory = [
    {
      description: 'Godwin Mordecai added an Attachment',
      createdAt: new Date(2024, 3, 11),
      previousState: 'None',
      currentState: 'File name free for all.png'
    },
    {
      description: 'Godwin Mordecai removed an attachment',
      createdAt: new Date(2024, 3, 10, 8, 30, 0),
      previousState: 'File name free for all.png',
      currentState: 'None'
    },
    {
      description: 'Godwin Mordecai updated the task',
      createdAt: new Date(2024, 3, 9, 8, 30, 0),
      previousState: 'None',
      currentState: 'Description: This is a description and you\'ll write a lot here naturally.'
    },
    {
      description: 'Godwin Mordecai changed the Status',
      createdAt: new Date(),
      previousState: 'TO DO',
      currentState: 'IN PROGRESS'
    },
    {
      description: 'Task created by Mordecai Godwin - Admin',
      createdAt: new Date(),
      previousState: '',
      currentState: ''
    }
  ]

  taskComments = [
    {
      id: 1,
      fullName: 'Mordecai Godwin',
      message: 'This is a comment and you\'ll write a lot here naturally.',
      createdAt: new  Date(2024, 3, 11),
    },
    {
      id: 2,
      fullName: 'Mordecai Godwin',
      message: 'This is a comment and you\'ll write a lot here naturally.',
      createdAt: new Date(2024, 3, 10, 8, 30, 0),
    },
    {
      id: 3,
      fullName: 'Mordecai Godwin',
      message: 'This is a comment and you\'ll write a lot here naturally.',
      createdAt: new Date(2024, 3, 9, 8, 30, 0),
    },
    {
      id: 4,
      fullName: 'Mordecai Godwin',
      message: 'This is a comment and you\'ll write a lot here naturally.',
      createdAt: new Date(),
    },
    {
      id: 5,
      fullName: 'Mordecai Godwin',
      message: 'This is a comment and you\'ll write a lot here naturally.',
      createdAt: new Date(),
    },
    {
      id: 6,
      fullName: 'Mordecai Godwin',
      message: 'This is a comment and you\'ll write a lot here naturally.',
      createdAt: new Date(),
    },
  ]

  commentMessage = '';
  
  ngOnInit(): void {
    console.clear();
    // this.getTask(); // TODO: uncomment this line
  }

  getTask(): void {
    this.notify.showLoader();
    this.taskService.getTask(this.taskId)
      .subscribe((res: Result<TaskModel>) => {
        this.notify.hideLoader();
        if (res.success) {
          this.task = res.content ?? {} as TaskModel;
        }
        else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      }
    );
  }

  toggleHistoryOrComments(): void {
    this.displayHistory = !this.displayHistory;
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
      createdAt: new Date()
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

  trimFileName(fileName: string): string {    
    // get the last substring of the file name as extension
    const extension = fileName.split('.').pop();
    return fileName.length > 20 ? `${fileName.slice(0, 20)}...${extension}` : fileName;
  }

  downloadAttachment(attachmentUrl: string): void {
    window.open(`${this.assetBaseUrl}/${attachmentUrl}`, '_blank');
  }

  async deleteAttachment(id: number): Promise<void> {
    // confirm action
    const confirmed = await this.notify.confirmDelete();
    if (!confirmed) return;
      
    // TODO: Implement API call

    // remove attachment from the task
    this.task.attachments = this.task.attachments.filter(attachment => attachment.id !== id);
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
        id: this.task.attachments.length + 1,
        name: fileName,
        type: fileType,
        url: '',
        thumbnailUrl: '',
        createdAt: new Date()
      }

      // add the new document to the task attachments
      this.task.attachments.push(newDocument);
    }    
  }
}