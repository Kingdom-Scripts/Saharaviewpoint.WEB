import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SideViewComponent, SideViewService, SvpButtonModule, SvpTaskStatusCardComponent, SvpTypographyModule, SvpUtilityModule } from '@svp-components';
import { ProjectModel, ProjectSearchModel, ProjectStatusEnum, Result, TaskBoardModel, TaskStatusEnum, TaskTypeEnum } from '@svp-models';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProjectService, TaskService } from '@svp-api-services';
import { SessionStorageUtility } from '@svp-utilities';
import { Router } from '@angular/router';
import { NotificationService } from '@svp-services';
import { Observable, Subject, catchError, concat, distinctUntilChanged, firstValueFrom, map, of, switchMap, tap } from 'rxjs';
import { UtcToLocalDatePipe } from '@svp-pipes';
import { AddTaskComponent } from '../../components/add-task/add-task.component';
import { TaskDetailsComponent } from '../../components/task-details/task-details.component';
import { ModalService } from 'src/app/shared/components/modal/modal.service';
import { ConfirmActionComponent, ConfirmActionResult } from 'src/app/shared/components/confirm-action/confirm-action.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  imports: [
    CommonModule,
    AngularSvgIconModule,
    SvpTaskStatusCardComponent,
    SvpUtilityModule,
    SvpTypographyModule,
    SvpButtonModule,
    SideViewComponent,
    DragDropModule,
    NgScrollbarModule,
    UtcToLocalDatePipe,
    NgSelectModule,
    FormsModule,
  ],
})
export class BoardComponent {
  taskService = inject(TaskService);
  sessionStorage = inject(SessionStorageUtility);
  notify = inject(NotificationService);
  sideViewService = inject(SideViewService);
  modalService = inject(ModalService);
  projectService = inject(ProjectService);
  router = inject(Router);

  projects$ = new Observable<ProjectModel[]>();
  projectInput$ = new Subject<string>();
  projectLoading = false;
  selectedProjectId!: number;

  allTypes = TaskTypeEnum.asArray;
  allTasks: TaskBoardModel[] = [];
  todoTasks: TaskBoardModel[] = [];
  inProgressTasks: TaskBoardModel[] = [];
  completedTasks: TaskBoardModel[] = [];

  constructor() {
    this.loadProjects();

    // get the globalProjectId from session storage
    const project = this.sessionStorage.getProject();
    if (project) {
      this.selectedProjectId = project.id;
      this.projects$ = of([project]);
      this.loadTasks();
    }
  }

  loadTasks() {
    this.notify.showLoader();
    this.taskService.listBoardTasks(this.selectedProjectId).subscribe((res: Result<TaskBoardModel[]>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.allTasks = res.content ?? [];
        this.todoTasks = this.allTasks.filter(task => task.status === TaskStatusEnum.TODO);
        this.inProgressTasks = this.allTasks.filter(task => task.status === TaskStatusEnum.IN_PROGRESS);
        this.completedTasks = this.allTasks.filter(task => task.status === TaskStatusEnum.COMPLETED);
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  private loadProjects(): void {
    const initialParam = {status: ProjectStatusEnum.IN_PROGRESS, priorityOnly: false} as ProjectSearchModel;
    this.projectService.listProjects(initialParam).pipe(
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
          switchMap((term) => this.projectService.listProjects({searchQuery: term, status: ProjectStatusEnum.IN_PROGRESS} as ProjectSearchModel)
          .pipe(
            catchError(() => of([])), // empty list on error
            tap(() => this.projectLoading = false)
          )),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map((data: any) => data.content.map((item: any) => item))
        )
      )
    })  
  }

  setProjectId($event: ProjectModel) {
    this.sessionStorage.setProject($event);
    this.loadTasks();
  }

  addNewTask(): void {
    this.sideViewService.showComponent(AddTaskComponent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.sideViewService.triggerOutputs$.subscribe((outputs: { [key: string]: any }) => {
      if (outputs['addedTask']) {
        this.allTasks.unshift(outputs['addedTask']);
        this.todoTasks.unshift(outputs['addedTask']);
      }
    });
  }

  viewTaskDetails(taskId: number): void {
    const inputs = { taskId: taskId };
    this.sideViewService.showComponent(TaskDetailsComponent, inputs);
  }

  async drop(event: CdkDragDrop<TaskBoardModel[]>) {
    console.log('--> Event:', event);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }

    // Access the item that was moved
    const movedItem = event.item.data;
    const currentId = event.container.id;

    const newStatus = currentId === 'todoList' ? TaskStatusEnum.TODO : currentId === 'inProgressList' ? TaskStatusEnum.IN_PROGRESS : TaskStatusEnum.COMPLETED;

    console.log('--> Moved Data:', currentId, movedItem, newStatus);

    // Move the item to the new status
    const moved = await this.moveTask(movedItem, newStatus);

    // update the task status if movement was successful
    if (moved) {
      movedItem.status = newStatus;
    }

    // revert movement if it failed
    else {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.previousContainer.data, event.currentIndex, event.previousIndex);
      } else {
        transferArrayItem(event.container.data, event.previousContainer.data, event.currentIndex, event.previousIndex);
      }
    }
  }

  async moveTask(task: TaskBoardModel, newStatus: string): Promise<boolean> {
    // eslint-disable-next-line prefer-const
    let param = { status: newStatus, reason: '' };

    // find out if task status is moving backwards
    if (
      (task.status === TaskStatusEnum.COMPLETED && newStatus === TaskStatusEnum.IN_PROGRESS) ||
      (task.status === TaskStatusEnum.IN_PROGRESS && newStatus === TaskStatusEnum.TODO)
    ) {
      // request user confirmation and reason for moving task backwards
      return await this.moveTaskBackwards(task, newStatus);
    }

    return await this.effectMovement(task, param);
  }

  async moveTaskBackwards(task: TaskBoardModel, newStatus: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.modalService.open(ConfirmActionComponent, {
        inputs: {
          title: 'Confirm Action',
          message: 'Please provide a reason for moving this task backwards in the board',
          confirmText: 'Move Task',
          cancelText: 'Keep Task',
        },
        outputs: {
          onActionConfirmed: async (result: ConfirmActionResult) => {
            console.log('--> Result:', result);
            if (result.confirmed) {
              const movementResult = await this.effectMovement(task, { status: newStatus, reason: result.reason });
              resolve(movementResult);
            } else {
              resolve(false);
            }
          },
        },
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async effectMovement(task: TaskBoardModel, param: any): Promise<boolean> {
    this.notify.timedInfoMessage('Saving changes...');
    this.notify.showLoader();
    try {
      const res: Result<string> = await firstValueFrom(this.taskService.moveTask(task.id, param));
      this.notify.hideLoader();
      if (res.success) {
        return true;
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
        return false;
      }
    } catch (error) {
      this.notify.hideLoader();
      // Handle any errors that might occur during the API call
      console.error('Error moving task:', error);
      return false;
    }
  }

  async deleteTask(task: TaskBoardModel): Promise<void> {
    const confirmed = await this.notify.confirmAction('Are you sure you want to delete this task? Every task under this will (if any) be deleted as well.', 'Delete Task');
    if (!confirmed) return;

    this.notify.showLoader();
    this.taskService.deleteTask(task.id).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('Task Deleted', 'Task has been deleted successfully');
        this.allTasks = this.allTasks.filter(task => task.id !== task.id);
        if (task.status === TaskStatusEnum.TODO) {
          this.todoTasks = this.todoTasks.filter(t => t.id !== task.id);
        }
        else if (task.status === TaskStatusEnum.IN_PROGRESS) {
          this.inProgressTasks = this.inProgressTasks.filter(t => t.id !== task.id);
        }
        else {
          this.completedTasks = this.completedTasks.filter(t => t.id !== task.id);
        }
      } else {
        this.notify.timedErrorMessage('Task Deletion Failed', res.message);
      }
    });
  }
}
