import { Component, OnInit, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {SvpTypographyModule, SvpButtonModule, SvpUtilityModule, SideViewComponent, SideViewService, SvpTaskStatusCardComponent} from '@svp-components';
import { CommonModule } from '@angular/common';
import { NxDropdownModule } from '@svp-directives';
import { FormsModule } from '@angular/forms';
import { TaskModel, TaskStatusEnum, Result, ProjectModel, ProjectSearchModel } from '@svp-models';
import { NotificationService } from '@svp-services';
import { ProjectService, TaskService } from '@svp-api-services';
import { SessionStorageUtility } from '@svp-utilities';
import { Router, RouterLink } from '@angular/router';
import { AddTaskComponent } from '../../components/add-task/add-task.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { Observable, Subject, catchError, concat, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

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
  sessionStorage = inject(SessionStorageUtility);
  notify = inject(NotificationService);
  sideViewService = inject(SideViewService);
  projectService = inject(ProjectService);
  router = inject(Router);

  showSideView = false;

    // TODO: initialize allTasks as an empty array
  allTasks: TaskModel[] = [];

  taskTypes: string[] = ['Epic', 'Task', 'Subtask'];
  selectedTaskType = 'Epic';

  taskStatusEnum = new TaskStatusEnum();
  statuses: string[] = this.taskStatusEnum.asArray;
  selectedStatus = '';

  projects$ = new Observable<ProjectModel[]>();
  projectInput$ = new Subject<string>();
  projectLoading = false;
  selectedProjectId = 0;

  constructor() {
    // set up task search
    this.taskService.allTasks.subscribe((tasks: TaskModel[]) => {
      this.allTasks = tasks;
    });

    // get the globalProjectId from session storage
    const projectId = this.sessionStorage.getProjectId();
    if (!projectId) {
      this.notify.timedInfoMessage('Select a project', 'Please select a project to view tasks');
    } else {
      this.selectedProjectId = projectId;
    }
  }

  ngOnInit(): void {
    // this.loadTasks(); // TODO: uncomment this line
    // this.addNewTask(); // TODO: remove this line
    this.loadProjects();
  }

  private loadProjects(): void {
    this.projectService.listProjects().pipe(
      switchMap((res: Result<ProjectModel[]>) => {
        if (!res.success) {
          this.notify.timedErrorMessage('Unable to retrieve projects', res.message);
        }
        console.log('--> Projects: ', res.content ?? [])
        return of (res.content ?? []);
      })
    ).subscribe((defaultItems: ProjectModel[]) => {
      this.projects$ = concat(
        of(defaultItems.map((item) => item)),
        this.projectInput$.pipe(
          distinctUntilChanged(),
          tap(() => this.projectLoading = true),
          switchMap((term) => this.projectService.listProjects({searchQuery: term} as ProjectSearchModel)
          .pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.projectLoading = false)
          )),
          map((data: any) => data.content.map((item: any) => item))
        )
      )
    })  
  }

  setProjectId($event: any) {
    this.sessionStorage.setProjectId($event.id);
    this.loadTasks();
  }

  loadTasks(): void {
    console.log('--> Project ID: ', this.selectedProjectId);
  }

  addNewTask(): void {
    this.sideViewService.showComponent(AddTaskComponent);
  }

  // viewTaskDetails(id: number): void {
  //   const inputs = {id: id};
  //   this.sideViewService.showComponent(ApproveTaskComponent, inputs);
  // }


}
