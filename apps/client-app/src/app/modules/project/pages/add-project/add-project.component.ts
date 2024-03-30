import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SvpFormInputModule, SvpButtonModule, SvpTypographyModule, mapValidationErrors, MaxInputLengthComponent } from '@svp-components';
import { CommonModule, NgFor } from '@angular/common';
import { Observable, Subject, catchError, concat, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { ProjectTypeModel, Result, ProjectModel } from '@svp-models';
import { NotificationService } from '@svp-services';
import { ProjectService } from '@svp-api-services';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    SvpButtonModule, 
    SvpTypographyModule,
    ReactiveFormsModule,
    SvpFormInputModule,
    NgFor,
    NgSelectModule,
    MaxInputLengthComponent
  ]
})
export class AddProjectComponent implements OnInit { 
  projectForm!: FormGroup;
  projectTypes$: Observable<ProjectTypeModel[]> = new Observable<ProjectTypeModel[]>;
  projectTypeInput$ = new Subject<string>();
  projectTypeLoading = false;

  designFile: File | null = null;
  
  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private notify: NotificationService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.initForm();

    this.loadProjectTypes();
  }

  initForm(): void {    
    this.projectForm = this.fb.group({
      title: ['', Validators.compose([Validators.required])],
      sizeOfSite: ['', Validators.compose([Validators.required])],
      startDate: [null, Validators.required],
      dueDate: [null, Validators.required],
      location: ['', Validators.compose([Validators.required])],
      description: ['', Validators.maxLength(5000)],
      type: ['', Validators.compose([Validators.required])],
      budget: [0, Validators.compose([Validators.required])],
      surroundingFacilities: [''],
      design: []
    });
  }
  
  private loadProjectTypes() {
    this.projectService.listTypes().pipe(
      switchMap((res: Result<ProjectTypeModel[]>) => {
        if (!res.success) {
          this.notify.timedErrorMessage('Unable to retrieve project types', res.message);
        }
        return of (res.content ?? []);
      })
    ).subscribe((defaultItems: ProjectTypeModel[]) => {
      this.projectTypes$ = concat(
        of(defaultItems.map((item) => item.name)),
        this.projectTypeInput$.pipe(
            distinctUntilChanged(),
            tap(() => this.projectTypeLoading = true),
            switchMap((term) => this.projectService.listTypes(term)
            .pipe(
                catchError(() => of([])), // empty list on error
                tap(() => this.projectTypeLoading = false)
            )),
          map((data: any) => data.content.map((item: any) => item.name))
        )
      );
    })        
  }

  onDesignFileChanged(files: File[]) {
    if (files.length > 0) {
      this.designFile = files[0];
    }
  }

  submitForm() {
    if (!this.projectForm.valid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    
    let formParam = this.getFormValue();

    this.notify.showLoader();
    this.projectService.createProject(formParam)
      .subscribe({
        next: async (res: Result<ProjectModel>) => {
          this.notify.hideLoader();
          console.log('Response from create project: ', res)
          if (res.success) {
            await this.notify.successMessage('Project Added!', `${res.content?.title} has been added successfully, a project manager will be in touch with you soon.`);

            this.router.navigate(['/project/all']);
          }
          else {
            this.notify.errorMessage(res.title, res.message);
          }
        },
        error: async (err: Result<any>) => {
          mapValidationErrors(this.projectForm, err.validationErrors);
          this.projectForm.markAllAsTouched();
        }
      })
  }

  getFormValue(): FormData {
    // get param
    let param = Object.assign({}, this.projectForm.value);
    console.log('--> Params: ', param);

    let formParam: FormData = new FormData();
    formParam.append('title', param.title);
    formParam.append('type', param.type);
    formParam.append('budget', param.budget);
    formParam.append('description', param.description);
    formParam.append('dueDate', param.dueDate);
    formParam.append('location', param.location);
    formParam.append('sizeOfSite', param.sizeOfSite);
    formParam.append('surroundingFacilities', param.surroundingFacilities);

    if (this.designFile)
      formParam.append('design', this.designFile as Blob, this.designFile?.name ?? '');

    return formParam;
  }

  get descriptionCount(): number {
    return this.projectForm.get('description')?.value.length ?? 0;
  }
  
  trackByFn(item: ProjectTypeModel) {
    return item.id;
  }
}