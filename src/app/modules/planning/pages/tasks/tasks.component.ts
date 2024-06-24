import { Component, OnDestroy, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SvpTypographyModule, SvpButtonModule, SvpUtilityModule, SideViewComponent, SideViewService, SvpTaskStatusCardComponent } from '@svp-components';
import { CommonModule } from '@angular/common';
import { NxDropdownModule } from '@svp-directives';
import { FormsModule } from '@angular/forms';
import { TaskModel, TaskStatusEnum, Result, ProjectModel, ProjectSearchModel, TaskSearchModel, ProjectStatusEnum } from '@svp-models';
import { NotificationService } from '@svp-services';
import { ProjectService, TaskService } from '@svp-api-services';
import { SessionStorageUtility } from '@svp-utilities';
import { Router, RouterLink } from '@angular/router';
import { AddTaskComponent } from '../../components/add-task/add-task.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { Observable, Subject, catchError, concat, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { TaskDetailsComponent } from '../../components/task-details/task-details.component';
import { UtcToLocalDatePipe } from '@svp-pipes';
import { MenuModule } from 'headlessui-angular';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidePanelService } from 'src/app/shared/components/side-panel/side-panel.service';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    SvpButtonModule,
    SvpTypographyModule,
    SvpUtilityModule,
    CommonModule,
    NxDropdownModule,
    FormsModule,
    SideViewComponent,
    RouterLink,
    NgSelectModule,
    SvpTaskStatusCardComponent,
    UtcToLocalDatePipe,
    MenuModule,
  ],
  animations: [
    trigger('toggleAnimation', [
      transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
      transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
    ]),
  ],
})
export class TasksComponent implements OnDestroy {
  sidePanelService = inject(SidePanelService);
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

  taskStatusEnum = TaskStatusEnum;
  statuses: string[] = ['Epic', 'Task'];
  selectedStatus = '';

  projects$ = new Observable<ProjectModel[]>();
  projectInput$ = new Subject<string>();
  projectLoading = false;
  selectedProjectId!: number;

  constructor() {
    // set up task search
    this.loadProjects();

    this.taskService.allTasks.subscribe((tasks: TaskModel[]) => {
      this.allTasks = tasks;
    });

    // get the globalProjectId from session storage
    const project = this.sessionStorage.getProject();
    if (project) {
      this.selectedProjectId = project.id;
      this.projects$ = of([project]);
      this.loadTasks();
    }
  }

  private loadProjects(): void {
    const initialParam = { status: ProjectStatusEnum.IN_PROGRESS, priorityOnly: false } as ProjectSearchModel;
    this.projectService
      .listProjects(initialParam)
      .pipe(
        switchMap((res: Result<ProjectModel[]>) => {
          if (!res.success) {
            this.notify.timedErrorMessage('Unable to retrieve projects', res.message);
          }
          console.log('--> Projects: ', res.content ?? []);
          return of(res.content ?? []);
        }),
      )
      .subscribe((defaultItems: ProjectModel[]) => {
        this.projects$ = concat(
          of(defaultItems.map(item => item)),
          this.projectInput$.pipe(
            distinctUntilChanged(),
            tap(() => (this.projectLoading = true)),
            switchMap(term =>
              this.projectService.listProjects({ searchQuery: term, status: ProjectStatusEnum.IN_PROGRESS } as ProjectSearchModel).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => (this.projectLoading = false)),
              ),
            ),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map((data: any) => data.content.map((item: any) => item)),
          ),
        );
      });
  }

  setProjectId($event: ProjectModel) {
    this.sessionStorage.setProject($event);
    this.loadTasks();
  }

  loadTasks(): void {
    this.notify.showLoader();
    this.taskService.listTasks({ projectId: this.selectedProjectId } as TaskSearchModel).subscribe((res: Result<TaskModel[]>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.allTasks = res.content ?? [];
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  addNewTask(): void {
    this.sidePanelService.open(AddTaskComponent, {
      title: 'Add New Task',
      outputs: {
        addedTask: (task: TaskModel) => {
          this.addNewTaskToAllTasks(task);
        },
      },
    });
  }

  addNewTaskToAllTasks(task: TaskModel): void {
    this.allTasks.unshift(task);
  }

  viewTaskDetails(taskId: number): void {
    const inputs = { taskId: taskId };
    this.sideViewService.showComponent(TaskDetailsComponent, inputs);
  }

  async deleteTask(taskId: number): Promise<void> {
    const confirmed = await this.notify.confirmAction('Are you sure you want to delete this task? Every task under this will (if any) be deleted as well.', 'Delete Task');
    if (!confirmed) return;

    this.notify.showLoader();
    this.taskService.deleteTask(taskId).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('Task Deleted', 'Task has been deleted successfully');
        this.allTasks = this.allTasks.filter(task => task.id !== taskId);
      } else {
        this.notify.timedErrorMessage('Task Deletion Failed', res.message);
      }
    });
  }

  ngOnDestroy(): void {
    this.sideViewService.triggerOutputs$.unsubscribe();
    this.sideViewService.closeSideView();
  }
}
