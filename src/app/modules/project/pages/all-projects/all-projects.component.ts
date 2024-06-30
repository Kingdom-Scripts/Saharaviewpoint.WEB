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
import { RouterLink } from '@angular/router';

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

  allProjects: ProjectModel[] | null = [];
  approveProjectRef!: SidePanelRef;
  
  constructor(
    public projectService: ProjectService,
    private notify: NotificationService) {
    // set up project search
    this.projectService.allProjects.subscribe((projects: ProjectModel[]) => {
      this.allProjects = projects;
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.viewProjectDetails(12);
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

  ngOnDestroy(): void {
    if(this.approveProjectRef) this.approveProjectRef.close();
  }
}
