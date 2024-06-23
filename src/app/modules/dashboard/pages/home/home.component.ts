import { Component, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {SvpButtonModule, SvpDashboardCardComponent, SvpTypographyModule, SvpUtilityModule } from '@svp-components';
import { CommonModule } from '@angular/common';
import { ProjectModel, ProjectStatusEnum, Result } from '@svp-models';
import { Router } from '@angular/router';
import { ProjectService } from '@svp-api-services';
import { NotificationService } from '@svp-services';
import { UtcToLocalDatePipe } from '@svp-pipes';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    SvpButtonModule,
    SvpTypographyModule,
    SvpUtilityModule,
    CommonModule,
    SvpDashboardCardComponent,
    UtcToLocalDatePipe
  ],
})
export class HomeComponent implements OnInit {
  projectStatusEnum = ProjectStatusEnum;

  projectCount = 0;
  allTasks = 0;
  allReports = 0;
  newMessages = 0;
  allProjects: ProjectModel[] | null = [];

  constructor(
    public projectService: ProjectService,
    private notify: NotificationService,
    private router: Router
  ) {
    this.projectService.allProjects.subscribe((projects: ProjectModel[]) => {
      this.allProjects = projects;
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.getProjectCount();
  }

  loadProjects(): void {
    this.notify.showLoader();

    this.projectService
      .listProjects()
      .subscribe(async (res: Result<ProjectModel[]>) => {
        this.notify.hideLoader();

        if (res.success) {
          this.allProjects = res.content ?? [];
        } else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      });
  }

  getProjectCount(): void {
    this.notify.showLoader();

    this.projectService
      .countProjects()
      .subscribe(async (res: Result<number>) => {
        this.notify.hideLoader();

        if (res.success) {
          this.projectCount = res.content ?? 0;
        } else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      });
  }

  navigateTo(route: string): void {
    console.log('navigateTo', route);
    this.router.navigate([route]);
  }
}
