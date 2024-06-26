import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, inject } from "@angular/core";
import { SvpButtonModule, SvpFormInputModule, SvpTypographyModule, SvpUtilityModule } from "@svp-components";
import { AngularSvgIconModule } from "angular-svg-icon";
import { NgSelectModule } from '@ng-select/ng-select';
import { ProjectManagerModel, ProjectModel, Result, StatusCodes } from "@svp-models";
import { ProjectService, UserService } from "@svp-api-services";
import { NotificationService } from "@svp-services";
import { Observable, Subject, catchError, concat, distinctUntilChanged, map, of, switchMap, tap } from "rxjs";
import { FormsModule } from "@angular/forms";
import { UtcToLocalDatePipe } from "@svp-pipes";

@Component({
  selector: 'svp-approve-project',
  standalone: true,
  templateUrl: './approve-project.component.html',
  imports: [
    SvpButtonModule,
    CommonModule,
    SvpUtilityModule,
    SvpTypographyModule,
    AngularSvgIconModule, SvpFormInputModule,
    NgSelectModule, FormsModule, UtcToLocalDatePipe
  ]
})
export class ApproveProjectComponent implements OnInit{
  @Input() id!: number;

  close!: () => void;

  projectService = inject(ProjectService);
  userService = inject(UserService);
  notify = inject(NotificationService);
  
  loadError: boolean | undefined = undefined;
  errorMessage!: string;
  project!: ProjectModel;

  selectedProjectManagerUid: string | null = null;
  projectManagersLoading = false;
  projectManagerInput$ = new Subject<string>();
  projectManagers$: Observable<ProjectManagerModel[]> = new Observable<ProjectManagerModel[]>();

  // 

  ngOnInit(): void {
    this.getProject();
  }

  getProject(): void {
    this.notify.showLoader();
    this.projectService.getProject(this.id)
      .subscribe({
        next: (res: Result<ProjectModel>) => {
          this.notify.hideLoader();
          if (res.success) {
            this.project = res.content!;
            this.loadError = false;

            // load project managers
            this.loadProjectManagers();
          } else {
            this.notify.timedErrorMessage('Failed to load project from inner', res.message);
            this.loadError = true;
          }
        },
        error: async (err: Result<ProjectModel>) => {
          console.log('Error loading project: ', err);
          this.notify.hideLoader();

          this.errorMessage = err.status === StatusCodes.FORBIDDEN
            ? 'You do not have permission to view this project.'
            : 'An error occurred while trying to load the project.';
          this.loadError = true;
        }
      });
  }

  loadProjectManagers(): void {
    this.userService.listProjectManagers()
      .pipe(
        switchMap((res: Result<ProjectManagerModel[]>) => {
          if (!res.success) {
            this.notify.timedErrorMessage('Failed to load project managers', res.message);
          }

          return of(res.content ?? []);
        })
      ).subscribe((defaultItems: ProjectManagerModel[]) => {
        this.projectManagers$ = concat(
          of(defaultItems.map((item) =>  {
            return {
              uid: item.uid,
              name: `${item.firstName} ${item.lastName}`
            }
          })),
          this.projectManagerInput$.pipe(
            distinctUntilChanged(),
            tap(() => this.projectManagersLoading = true),
            switchMap((term) => this.userService.listProjectManagers({searchQuery: term})
            .pipe(
              catchError(() => of([])), // empty list on error
              tap(() => this.projectManagersLoading = false)
            )),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            map((data: any) => data.content?.map((item: any) => {
              return {
                uid: item.uid,
                name: `${item.firstName} ${item.lastName}`
              }
            }))
          )
        );
      })
  }

  assignProjectManager(): void {
    if (this.selectedProjectManagerUid == null) {
      this.notify.timedErrorMessage('Select Project Manager', 'Please select a project manager to assign to this project');
      return;
    }
    console.log('--> Selected Project Manager: ', this.selectedProjectManagerUid);

    this.notify.showLoader();
    this.projectService.approveProject(this.id, this.selectedProjectManagerUid)
      .subscribe((res: Result<ProjectModel>) => {
        this.notify.hideLoader();
        if (res.success) {
          this.notify.timedSuccessMessage('Project Approved', 'Project has been approved and assigned to the selected project manager');
          this.close();
        } else {
          this.notify.timedErrorMessage('Failed to approve project', res.message);
        }
      });
  }
}