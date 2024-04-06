import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { ProjectService } from "@svp-api-services";
import { MaxInputLengthComponent, SideViewService, SvpButtonModule, SvpFormInputModule, SvpTypographyModule } from "@svp-components";
import { Result, ProjectModel, ProjectSearchModel } from "@svp-models";
import { NotificationService, StorageService } from "@svp-services";
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
  fb = inject(FormBuilder);
  
  @Output() exit = new EventEmitter();

  globalProjectId!: number | null;

  formGroup!: FormGroup;
  taskTypes!: [];
  projects$ = new Observable<ProjectModel[]>();
  projectInput$ = new Subject<string>();
  projectLoading = false;

  reporters$: Observable<[]> = new Observable<[]>();
  reporterInput$ = new Subject<string>();
  reporterLoading = false;

  attachments: File[] | null = null;

  ngOnInit(): void {
    this.loadProjects();
    this.initForm();
    this.globalProjectId = this.sessionStorage.getProjectId();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      projectId: [this.globalProjectId],
      type: [''],
      summary: [''],
      description: [''],
      reporterId: [''],      
      dueDate: [''],
      attachments: [''],
    });
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

  onFilesChanged(files: File[]) {
    if (files.length > 0) {
      this.attachments = files;
    }
  }
  
  close() {
    this.exit.emit();
  }
}