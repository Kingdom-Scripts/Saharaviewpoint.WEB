import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {SvpTypographyModule, SvpButtonModule, SvpUtilityModule, SideViewComponent, SideViewService, SvpTaskStatusCardComponent} from '@svp-components';
import { CommonModule } from '@angular/common';
import { NxDropdownModule } from '@svp-directives';
import { FormsModule } from '@angular/forms';
import { TaskModel, TaskStatusEnum, Result, ProjectModel, ProjectSearchModel, TaskSearchModel } from '@svp-models';
import { NotificationService } from '@svp-services';
import { ProjectService, TaskService } from '@svp-api-services';
import { SessionStorageUtility } from '@svp-utilities';
import { Router, RouterLink } from '@angular/router';
import { AddTaskComponent } from '../../components/add-task/add-task.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { Observable, Subject, catchError, concat, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { TaskDetailsComponent } from '../../components/task-details/task-details.component';
import { UtcToLocalDatePipe } from '@svp-pipes';

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
    SvpTaskStatusCardComponent,
    UtcToLocalDatePipe
  ],
})
export class TasksComponent implements OnInit, OnDestroy {
  taskService = inject(TaskService);
  sessionStorage = inject(SessionStorageUtility);
  notify = inject(NotificationService);
  sideViewService = inject(SideViewService);
  projectService = inject(ProjectService);
  router = inject(Router);

  showSideView = false;

  allTasks: TaskModel[] = [];

  taskTypes: string[] = ['Epic', 'Task', 'Subtask'];
  selectedTaskType = 'Epic';

  taskStatusEnum = new TaskStatusEnum();
  statuses: string[] = ['Epic', 'Task']
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
    const project = this.sessionStorage.getProject();
    if (!project) {
      this.notify.timedInfoMessage('Select a project', 'Please select a project to view tasks');
    } else {
      this.selectedProjectId = project.id;
      this.projects$ = of([project]);
    }
  }

  ngOnInit(): void {
    this.loadTasks();
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
    this.sessionStorage.setProject($event);
    this.loadTasks();
  }

  loadTasks(): void {
    this.notify.showLoader();
    this.taskService.listTasks({projectId: this.selectedProjectId} as TaskSearchModel)
      .subscribe((res: Result<TaskModel[]>) => {
        this.notify.hideLoader();
        if (res.success) {
          this.allTasks = res.content ?? [];
        } else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      }
    );
  }

  addNewTask(): void {
    this.sideViewService.showComponent(AddTaskComponent);
        
    this.sideViewService.triggerOutputs$.subscribe((outputs: { [key: string]: any}) => {
      if (outputs['addedTask']) {
        this.allTasks.unshift(outputs['addedTask']);
      }
    });
  }

  viewTaskDetails(taskId: number): void {
    const inputs = {taskId: taskId};
    this.sideViewService.showComponent(TaskDetailsComponent, inputs);
  }

  ngOnDestroy(): void {
    this.sideViewService.triggerOutputs$.unsubscribe();
    this.sideViewService.closeSideView();
  }
}