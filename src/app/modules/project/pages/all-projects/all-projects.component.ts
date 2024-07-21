import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SvpTypographyModule, SvpButtonModule, SvpUtilityModule, SideViewComponent, SideViewService } from '@svp-components';
import { CommonModule } from '@angular/common';
import { NxDropdownModule } from '@svp-directives';
import { FormsModule } from '@angular/forms';
import { ProjectModel, ProjectStatusEnum, Result } from '@svp-models';
import { NotificationService } from '@svp-services';
import { ProjectService } from '@svp-api-services';
import { ApproveProjectComponent } from '../../components/approve-project.component';
import { UtcToLocalDatePipe } from '@svp-pipes';
import { SidePanelService } from 'src/app/shared/components/side-panel/side-panel.service';
import { SidePanelRef } from 'src/app/shared/components/side-panel/side-panel-ref';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({ 
  selector: 'app-all-projects',
  templateUrl: './all-projects.component.html',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    SvpButtonModule,
    SvpTypographyModule,
    SvpUtilityModule, CommonModule, NxDropdownModule,
    FormsModule,
    SideViewComponent,
    UtcToLocalDatePipe, RouterLink
  ],
})
export class AllProjectsComponent implements OnInit, OnDestroy {
  projectStatusEnum = ProjectStatusEnum;
  sideViewService = inject(SideViewService);
  sidePanel = inject(SidePanelService);
  projectService = inject(ProjectService);
  notify = inject(NotificationService);
  activatedRoute = inject(ActivatedRoute);

  allProjects: ProjectModel[] | null = [];
  approveProjectRef!: SidePanelRef;
  
  constructor() {
    // set up project search
    this.projectService.allProjects.subscribe((projects: ProjectModel[]) => {
      this.allProjects = projects;
    });

    // check if there is an approve query
    this.activatedRoute.queryParams.subscribe(async (params) => {
      console.log(params);
      if (params['approve']) {
        const projectId = Number(params['approve']);
        this.viewProjectDetails(projectId);
      }
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.notify.showLoader();

    this.projectService.listProjects().subscribe(
      async (res: Result<ProjectModel[]>) => {
        this.notify.hideLoader();

        if (res.success) {
          this.allProjects = res.content ?? [];
        } 
        else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      }
    );
  }

  viewProjectDetails(id: number): void {
    const inputs = {id: id};
    this.approveProjectRef = this.sidePanel.open(ApproveProjectComponent, {
      inputs: inputs,
      size: 'large'
    });
  }

  async completeProject(project: ProjectModel): Promise<void> {
    const confirmed = await this.notify.confirmAction('Are you sure you want to complete this project?');
    if (!confirmed) return;
    
    this.notify.showLoader();
    this.projectService.completeProject(project.id).subscribe(
      async (res: Result<ProjectModel>) => {
        this.notify.hideLoader();

        if (res.success) {
          this.notify.timedSuccessMessage(res.message);
          project.status = ProjectStatusEnum.COMPLETED;
          project.completedOn = res.content?.completedOn ?? new Date();
          project.updatedOn = res.content?.updatedOn ?? new Date();
        } 
        else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if(this.approveProjectRef) this.approveProjectRef.close();
  }
}
