import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProjectService, TaskService } from '@svp-api-services';
import { MaxInputLengthComponent, SvpButtonModule, SvpFormInputModule, SvpTypographyModule, mapValidationErrors } from '@svp-components';
import { Result, ProjectModel, ProjectSearchModel, TaskTypeEnum, TaskModel, TaskSearchModel } from '@svp-models';
import { NotificationService } from '@svp-services';
import { SessionStorageUtility } from '@svp-utilities';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Observable, Subject, catchError, concat, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    ReactiveFormsModule,
    NgSelectModule,
    SvpButtonModule,
    SvpTypographyModule,
    SvpFormInputModule,
    MaxInputLengthComponent,
  ],
})
export class AddTaskComponent implements OnInit {
  sessionStorage = inject(SessionStorageUtility);
  notify = inject(NotificationService);
  projectService = inject(ProjectService);
  taskService = inject(TaskService);
  fb = inject(FormBuilder);
  taskTypeEnum = TaskTypeEnum;

  close!: () => void;

  @Output() addedTask = new EventEmitter<TaskModel>();

  today = new Date();
  globalProjectId!: number | null;

  formGroup!: FormGroup;
  parentLabel: string | undefined = undefined;
  taskTypes = this.taskTypeEnum.asArray;

  projects$ = new Observable<ProjectModel[]>();
  projectInput$ = new Subject<string>();
  projectLoading = false;

  taskSearchModel = new TaskSearchModel();
  tasks$ = new Observable<TaskModel[]>();
  taskInput$ = new Subject<string>();
  taskLoading = false;

  attachments: File[] | null = null;

  constructor() {
    const globalProject = this.sessionStorage.getProject();
    if (globalProject) {
      this.globalProjectId = globalProject.id;
      this.projects$ = of([globalProject]);

      this.taskSearchModel.projectId = this.globalProjectId;
    }
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadTasks();
    this.initForm();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      projectId: [this.globalProjectId, Validators.compose([Validators.required])],
      type: [null, Validators.compose([Validators.required])],
      parentId: [null],
      summary: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      description: ['', Validators.compose([Validators.maxLength(5000)])],
      expectedStartDate: ['', Validators.compose([Validators.required])],
      dueDate: ['', Validators.compose([Validators.required])],
      attachments: [''],
    });
  }

  createTask(): void {
    if (!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const formParam = this.getFormValue();

    this.notify.showLoader();
    this.taskService.createTask(formParam).subscribe({
      next: (res: Result<TaskModel>) => {
        this.notify.hideLoader();
        if (res.success) {
          this.notify.timedSuccessMessage('Task Created', 'Task has been created successfully');
          this.addedTask.next(res.content ?? ({} as TaskModel));
          this.close();
        } else {
          this.notify.timedErrorMessage('Task Creation Failed', res.message);
        }
      },
      error: (error: Result<string>) => {
        this.notify.hideLoader();
        mapValidationErrors(this.formGroup, error.validationErrors);
        this.formGroup.markAllAsTouched();
      },
    });
  }

  getFormValue(): FormData {
    const formData = new FormData();
    formData.append('projectId', this.formGroup.get('projectId')?.value);
    formData.append('type', this.formGroup.get('type')?.value);
    formData.append('summary', this.formGroup.get('summary')?.value);
    formData.append('description', this.formGroup.get('description')?.value);
    formData.append('expectedStartDate', this.formGroup.get('expectedStartDate')?.value);
    formData.append('dueDate', this.formGroup.get('dueDate')?.value);
    formData.append('parentId', this.formGroup.get('parentId')?.value);
    if (this.attachments) {
      this.attachments.forEach((file: File) => {
        formData.append('attachments', file as Blob, file?.name ?? '');
      });
    }
    return formData;
  }

  private loadProjects(): void {
    this.projectService
      .listProjects()
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
              this.projectService.listProjects({ searchQuery: term } as ProjectSearchModel).pipe(
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

  private loadTasks(): void {
    this.taskService
      .listTasks({ projectId: this.globalProjectId } as TaskSearchModel)
      .pipe(
        switchMap((res: Result<TaskModel[]>) => {
          console.log('--> Tasks: ', res.content ?? []);
          return of(res.content ?? []);
        }),
      )
      .subscribe((defaultItems: TaskModel[]) => {
        this.tasks$ = concat(
          of(defaultItems.map(item => item)),
          this.taskInput$.pipe(
            distinctUntilChanged(),
            tap(() => (this.taskLoading = true)),
            switchMap(term =>
              this.taskService.listTasks({ searchQuery: term } as TaskSearchModel).pipe(
                catchError(() => of([])), // empty list on error
                tap(() => (this.taskLoading = false)),
              ),
            ),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map((data: any) => data.content.map((item: any) => item)),
          ),
        );
      });
  }

  taskTypeChanged($event: string): void {
    if ($event === TaskTypeEnum.SUBTASK) {
      this.parentLabel = 'Assign To A Task';
      this.formGroup.get('parentId')?.setValidators([Validators.required]);

      // load only tasks
      this.taskSearchModel.type = TaskTypeEnum.TASK;
      this.loadTasks();
    } else if ($event === TaskTypeEnum.TASK) {
      this.parentLabel = 'Assign To A Epic';
      this.formGroup.get('parentId')?.clearValidators();

      // load only Epics
      this.taskSearchModel.type = TaskTypeEnum.EPIC;
      this.loadTasks();
    } else {
      this.parentLabel = undefined;
      this.formGroup.get('parentId')?.clearValidators();
    }

    this.formGroup.get('parentId')?.updateValueAndValidity();
  }

  onFilesChanged(files: File[]) {
    if (files.length > 0) {
      this.attachments = files;
    } else {
      this.attachments = null;
    }
  }
}
