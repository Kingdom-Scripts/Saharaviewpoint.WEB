import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { NgSelectModule } from "@ng-select/ng-select";
import { TaskService } from "@svp-api-services";
import { SvpButtonModule, SvpTypographyModule } from "@svp-components";
import { Result, TaskModel, TaskStatusEnum, TaskTypeEnum } from "@svp-models";
import { NotificationService } from "@svp-services";
import { AngularSvgIconModule } from "angular-svg-icon";
import { UtcToLocalDatePipe } from "@svp-pipes";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { environment } from "libs/shared/environments/environment";

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    NgSelectModule,
    SvpButtonModule,
    SvpTypographyModule,
    UtcToLocalDatePipe
  ]
})
export class TaskDetailsComponent implements OnInit {
  taskService = inject(TaskService); 
  notify = inject(NotificationService);

  @Input({required: true}) taskId!: number;
  @Output() exit = new EventEmitter();

  assetBaseUrl = environment.assetBaseUrl;
  
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
    "summary": "First of the first",
    "description": "This is a description and you'll write a lot here naturally.",
    "createdAt": new Date(),
    "expectedStartDate": new Date(),
    "dueDate": new Date(),
    "order": 0
  };
  taskHistory = [
    {
      description: 'Godwin Mordecai added an Attachment',
      createdAt: new Date(),
      previousState: 'None',
      currentState: 'File name free for all.png'
    },
    {
      description: 'Godwin Mordecai removed an attachment',
      createdAt: new Date(),
      previousState: 'File name free for all.png',
      currentState: 'None'
    },
    {
      description: 'Godwin Mordecai updated the task',
      createdAt: new Date(),
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
        }
        else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      }
    );
  }
  
}