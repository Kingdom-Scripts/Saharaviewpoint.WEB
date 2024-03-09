import { Component, OnInit, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SvpTypographyModule, SvpButtonModule, SvpUtilityModule, SideViewComponent, SideViewService } from '@svp-components';
import { CommonModule } from '@angular/common';
import { NxDropdownModule } from '@svp-directives';
import { FormsModule } from '@angular/forms';
import { ProjectModel, ProjectStatusEnum, Result } from '@svp-models';
import { NotificationService } from '@svp-services';
import { ProjectService } from '@svp-api-services';
import { ApproveProjectComponent } from '../../components/approve-project.component';

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
    SideViewComponent
  ],
})
export class AllProjectsComponent implements OnInit {
  @ViewChild('sample', { static: true, read: ViewContainerRef }) sample!: ViewContainerRef;
  projectStatusEnum = new ProjectStatusEnum();
  showSideView = false;
  sideViewService = inject(SideViewService);

    // TODO: initialize allProjects as an empty array
  allProjects: ProjectModel[] | null = // [];
  [
    {
      id: 71,
      title: 'First Project',
      description: 'Just another sample description',
      status: 'In Progress',
      dueDate: new Date(),
      startDate: new Date(),
      isPriority: true,
      order: 1,
    },
    {
      id: 8,
      title: 'Second Project',
      description: 'Just another sample description',
      status: 'Completed',
      startDate: new Date(),
      dueDate: new Date(),
      isPriority: false,
      order: 2,
    },
    {
      id: 9,
      title: 'Second Project',
      description: 'Just another sample description',
      status: 'Completed',
      startDate: new Date(),
      dueDate: new Date(),
      isPriority: false,
      order: 2,
    },
    {
      id: 10,
      title: 'Second Project',
      description: 'Just another sample description',
      status: 'In Progress',
      startDate: new Date(),
      dueDate: new Date(),
      isPriority: false,
      order: 2,
    }
  ];
  
  constructor(
    public projectService: ProjectService,
    private notify: NotificationService,
    private sideViewComponent: SideViewComponent, private side: SideViewService
  ) {

    // set up project search
    this.projectService.allProjects.subscribe((projects: ProjectModel[]) => {
      this.allProjects = projects;
    });
  }

  ngOnInit(): void {
    const tt = 2; // TODO: remove this line
    // this.loadProjects(); // TODO: uncomment this line
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

  viewProjectDetails(): void {
    // this.sample.clear();
    
    // this.sideViewComponent.loadComponent(ApproveProjectComponent);
    // this.side.openSideView(ApproveProjectComponent);

    this.sideViewService.showComponent(ApproveProjectComponent);
    // this.showSideView = true;
  }
}
