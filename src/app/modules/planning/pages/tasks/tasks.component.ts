import { Component, OnDestroy, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {
  SvpTypographyModule,
  SvpButtonModule,
  SvpUtilityModule,
  SideViewComponent,
  SvpTaskStatusCardComponent,
  MaxInputLengthComponent,
} from '@svp-components';
import { CommonModule } from '@angular/common';
import { NxDropdownModule } from '@svp-directives';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskModel, TaskStatusEnum, Result, ProjectModel, ProjectSearchModel, TaskSearchModel, ProjectStatusEnum } from '@svp-models';
import { NotificationService } from '@svp-services';
import { ProjectService, TaskService } from '@svp-api-services';
import { SessionStorageUtility } from '@svp-utilities';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AddTaskComponent } from '../../components/add-task/add-task.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { Observable, Subject, catchError, concat, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { TaskDetailsComponent } from '../../components/task-details/task-details.component';
import { UtcToLocalDatePipe } from '@svp-pipes';
import { trigger, transition, style, animate } from '@angular/animations';
import { SidePanelService } from 'src/app/shared/components/side-panel/side-panel.service';
import { SidePanelRef } from 'src/app/shared/components/side-panel/side-panel-ref';
import { SvpValidationErrorsComponent } from 'src/app/shared/components/input-fields/svp-validation-errors.component';
import { ApprovalService } from 'src/app/shared/api-services/approval.service';
import { ProjectTaskApprovalModel } from 'src/app/shared/models/api-response-models/approvals/project-task-approval.model';

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
    ReactiveFormsModule,
    SvpValidationErrorsComponent,
    MaxInputLengthComponent,
  ],
  animations: [
    trigger('toggleAnimation', [
      transition(':enter', [style({ opacity: 0, transform: 'scale(0.95)' }), animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))]),
      transition(':leave', [animate('75ms', style({ opacity: 0, transform: 'scale(0.95)' }))]),
    ]),
  ],
})
export class TasksComponent implements OnDestroy {
  taskService = inject(TaskService);
  approvalService = inject(ApprovalService);
  sessionStorage = inject(SessionStorageUtility);
  notify = inject(NotificationService);
  sidePanel = inject(SidePanelService);
  projectService = inject(ProjectService);
  activatedRouter = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);

  showSideView = false;

  taskSearchParams = new TaskSearchModel();
  allTasks: TaskModel[] = [];

  taskTypes: string[] = ['Epic', 'Task', 'Subtask'];
  selectedTaskType = ['Epic'];

  taskStatusEnum = TaskStatusEnum;
  statuses: string[] = ['TO DO', 'IN PROGRESS', 'COMPLETED'];
  selectedStatus = '';

  projects$ = new Observable<ProjectModel[]>();
  projectInput$ = new Subject<string>();
  projectLoading = false;
  selectedProjectId = 0;
  selectedProject!: ProjectModel;

  taskDetailRef!: SidePanelRef;
  addTaskRef!: SidePanelRef;

  selectedTask!: TaskModel;
  dueDateFormIsOpen = false;
  dueDateForm: FormGroup = this.fb.group({
    reason: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(5000)])],
    dueDate: ['', Validators.required],
  });

  approvalLoading = true;
  approval!: ProjectTaskApprovalModel | undefined;

  constructor() {
    // set up task search
    this.loadProjects();

    this.taskService.allTasks.subscribe((tasks: TaskModel[]) => {
      this.allTasks = tasks;
    });

    this.activatedRouter.queryParams.subscribe(params => {
      // check if a specific project was requested
      const id = params['projectId'];
      if (id) {
        this.projectService.getProject(id).subscribe((res: Result<ProjectModel>) => {
          if (res.success) {
            this.selectedProject = res.content ?? ({} as ProjectModel);
            this.projects$ = of([this.selectedProject]);
            this.selectedProjectId = this.selectedProject.id;
            this.loadTasks();
          } else {
            this.notify.timedErrorMessage('Project Not Found', res.message);

            // navigate back
            this.router.navigate(['../'], { relativeTo: this.activatedRouter });
          }
        });
      } else {
        // get the globalProjectId from session storage
        const project = this.sessionStorage.getProject();
        if (project) {
          this.selectedProject = project;
          this.selectedProjectId = this.selectedProject.id;
          this.projects$ = of([project]);
          this.loadTasks();
        }
      }
    });
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

  loadTasks(): void {
    this.taskSearchParams.projectId = this.selectedProjectId;
    this.notify.showLoader();
    this.taskService.listTasks(this.taskSearchParams).subscribe((res: Result<TaskModel[]>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.allTasks = res.content ?? [];

        // load task approval
        this.loadTaskApproval();
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  setProject($event: ProjectModel) {
    this.sessionStorage.setProject($event);
    this.selectedProject = $event;
    this.selectedProjectId = this.selectedProject.id;
    this.loadTasks();
  }

  loadTaskApproval(): void {
    this.approvalLoading = true;
    this.approval = undefined;

    this.approvalService.getProjectTaskApproval(this.selectedProjectId).subscribe((res: Result<ProjectTaskApprovalModel>) => {
      this.approvalLoading = false;
      if (res.success && res.status === 200) {
        this.approval = res.content ?? ({} as ProjectTaskApprovalModel);
      }
    });
  }

  sendTaskSetupsForApproval(): void {
    this.notify.showLoader();
    this.approvalService.sendProjectTasksForApproval(this.selectedProjectId).subscribe((res: Result<ProjectTaskApprovalModel>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('Approval Request Sent', 'Approval request has been sent successfully');
        this.approval = res.content ?? ({} as ProjectTaskApprovalModel);
      } else {
        this.notify.timedErrorMessage('Approval Request Failed', res.message);
      }
    });
  }

  sendTaskApprovalReminder(): void {
    if (!this.approval) {
      this.notify.timedErrorMessage('Approval Not Found', 'Approval request has not been sent for the selected project.');
      return;
    }
    
    this.notify.showLoader();
    this.approvalService.sendProjectTaskApprovalReminder(this.selectedProjectId, this.approval?.id).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('Reminder Sent', 'Approval reminder has been sent successfully');
      } else {
        this.notify.timedErrorMessage('Reminder Failed', res.message);
      }
    });
  }

  addNewTask(): void {
    this.addTaskRef = this.sidePanel.open(AddTaskComponent, {
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
    this.taskDetailRef = this.sidePanel.open(TaskDetailsComponent, {
      inputs: { taskId: taskId },
      size: 'large',
    });
  }

  changeTaskStatus(task: TaskModel, status: string): void {
    const param = { status: status };

    this.notify.showLoader();
    this.taskService.changeTaskStatus(task.id, param).subscribe((res: Result<TaskModel>) => {
      this.notify.hideLoader();
      if (res.success) {
        task.status = res.content?.status ?? status;
        task.updatedAt = res.content?.updatedAt ?? task.updatedAt;
      } else {
        this.notify.errorMessage('Task Update Failed', res.message);
      }
    });
  }

  async deleteTask(taskId: number): Promise<void> {
    const confirmed = await this.notify.confirmAction(
      'Are you sure you want to delete this task? Every task under this will (if any) be deleted as well.',
      'Delete Task',
    );
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

  changeDueDate(task: TaskModel): void {
    this.selectedTask = task;

    // convert task due to fit html input date format
    const dueDate = new Date(task.dueDate);
    const formattedDueDate = `${dueDate.getFullYear()}-${(dueDate.getMonth() + 1).toString().padStart(2, '0')}-${dueDate
      .getDate()
      .toString()
      .padStart(2, '0')}`;
    this.dueDateForm.controls['dueDate'].setValue(formattedDueDate);

    this.dueDateForm.controls['reason'].setValue('');
    this.dueDateFormIsOpen = true;
  }

  saveNewDueDate(): void {
    if (!this.dueDateForm.valid) {
      this.dueDateForm.markAllAsTouched();
      return;
    }

    const param = {
      dueDate: this.dueDateForm.value.dueDate,
      reason: this.dueDateForm.value.reason,
    };

    this.notify.showLoader();
    this.taskService.changeDueDate(this.selectedTask.id, param).subscribe((res: Result<TaskModel>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('Due Date Updated', 'Due date has been updated successfully');
        this.selectedTask.dueDate = res.content?.dueDate ?? this.selectedTask.dueDate;
        this.selectedTask.updatedAt = res.content?.updatedAt ?? this.selectedTask.updatedAt;
        this.dueDateFormIsOpen = false;
      } else {
        this.notify.timedErrorMessage('Due Date Update Failed', res.message);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.taskDetailRef) this.taskDetailRef.close();
    if (this.addTaskRef) this.addTaskRef.close();
  }
}
