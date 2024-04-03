import { Component, OnInit, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {SvpTypographyModule, SvpButtonModule, SvpUtilityModule, SideViewComponent, SideViewService, SvpTaskStatusCardComponent} from '@svp-components';
import { CommonModule } from '@angular/common';
import { NxDropdownModule } from '@svp-directives';
import { FormsModule } from '@angular/forms';
import { TaskModel, TaskStatusEnum, Result, ProjectModel } from '@svp-models';
import { NotificationService } from '@svp-services';
import { TaskService } from '@svp-api-services';
import { SessionStorageUtility } from '@svp-utilities';
import { Router, RouterLink } from '@angular/router';
import { AddTaskComponent } from '../../components/add-task/add-task.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { projectMockData } from 'apps/admin-app/src/app/shared/mock-data/projects.mock';
import { tasksMock as tasksMockData } from 'apps/admin-app/src/app/shared/mock-data/tasks.mock';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    SvpButtonModule,
    SvpTypographyModule,
    SvpUtilityModule, CommonModule, NxDropdownModule,
    FormsModule,
    SideViewComponent,
    RouterLink,
    NgSelectModule,
    SvpTaskStatusCardComponent
  ],
})
export class TasksComponent implements OnInit {
  taskService = inject(TaskService);
  storageService = inject(SessionStorageUtility);
  notify = inject(NotificationService);
  sideViewService = inject(SideViewService);
  router = inject(Router);

  projectUid: string |  null;
  showSideView = false;

    // TODO: initialize allTasks as an empty array
  allTasks: TaskModel[] = tasksMockData;

  taskTypes: string[] = ['Epic', 'Task', 'Subtask'];
  selectedTaskType = 'Epic';

  taskStatusEnum = new TaskStatusEnum();
  statuses: string[] = this.taskStatusEnum.asArray;
  selectedStatus = '';

  projects: ProjectModel[] = projectMockData;
  selectedProjects: number[] = [1];

  constructor() {
    // set up task search
    this.taskService.allTasks.subscribe((tasks: TaskModel[]) => {
      this.allTasks = tasks;
    });

    // get the projectUid from session storage
    this.projectUid = this.storageService.get('projectUid');
    if (!this.projectUid) {
      this.handleError();
    }
  }

  projectIndex(title: string): number {
    return this.projects.findIndex((project: ProjectModel) => project.title === title);
  }

  async handleError(): Promise<void> {
    const finish = await this.notify.errorMessage('Error', 'Project not found');
    if (finish) {
      this.router.navigate(['/project/all']);
    }
  }

  ngOnInit(): void {
    // this.loadTasks(); // TODO: uncomment this line
    this.addNewTask(); // TODO: remove this line
    console.log('--> Projects: ', this.projects);
    const i = 4;
  }

  addNewTask(): void {
    const inputs = {projectUid: this.projectUid};
    this.sideViewService.showComponent(AddTaskComponent, inputs);
  }

  // viewTaskDetails(id: number): void {
  //   const inputs = {id: id};
  //   this.sideViewService.showComponent(ApproveTaskComponent, inputs);
  // }


}
