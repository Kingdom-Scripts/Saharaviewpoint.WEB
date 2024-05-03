import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { ProjectService, TaskService } from "@svp-api-services";
import { MaxInputLengthComponent, SideViewService, SvpButtonModule, SvpFormInputModule, SvpTypographyModule, mapValidationErrors } from "@svp-components";
import { Result, ProjectModel, ProjectSearchModel, TaskTypeEnum, TaskModel } from "@svp-models";
import { NotificationService } from "@svp-services";
import { SessionStorageUtility } from "@svp-utilities";
import { AngularSvgIconModule } from "angular-svg-icon";
import { Observable, Subject, catchError, concat, distinctUntilChanged, map, of, switchMap, tap } from "rxjs";

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
    MaxInputLengthComponent
  ]
})
export class AddTaskComponent implements OnInit {
  sessionStorage = inject(SessionStorageUtility)
  sideViewService = inject(SideViewService);
  notify = inject(NotificationService);
  projectService = inject(ProjectService);
  taskService = inject(TaskService);
  fb = inject(FormBuilder);
  taskTypeEnum = new TaskTypeEnum();
  
  @Output() exit = new EventEmitter();
  
  today = new Date();
  globalProjectId!: number | null;

  formGroup!: FormGroup;
  taskTypes = this.taskTypeEnum.asArray;
  projects$ = new Observable<ProjectModel[]>();
  projectInput$ = new Subject<string>();
  projectLoading = false;

  attachments: File[] | null = null;

  constructor() {
    const globalProject = this.sessionStorage.getProject();
    if (globalProject) {
      this.globalProjectId = globalProject.id;
      this.projects$ = of([globalProject]);
    }
  }
  
  ngOnInit(): void {
    this.loadProjects();
    this.initForm();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      projectId: [this.globalProjectId, Validators.compose([Validators.required])],
      type: ['', Validators.compose([Validators.required])],
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
          this.sideViewService.triggerOutputs$.next({'addedTask': res.content});
          this.exit.emit();
        } else {
          this.notify.timedErrorMessage('Task Creation Failed', res.message);
        }
      },
      error: (error: Result<string>) => {
        this.notify.hideLoader();
        mapValidationErrors(this.formGroup, error.validationErrors);
        this.formGroup.markAllAsTouched();
      }
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
    if (this.attachments) {
      this.attachments.forEach((file: File) => {
        formData.append('attachments', file as Blob, file?.name ?? '');
      });
    }
    return formData;
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map((data: any) => data.content.map((item: any) => item))
        )
      )
    })  
  }

  onFilesChanged(files: File[]) {
    if (files.length > 0) {
      this.attachments = files;
    } 
    else {
      this.attachments = null;
    }
  }
  
  close() {
    this.exit.emit();
  }
}