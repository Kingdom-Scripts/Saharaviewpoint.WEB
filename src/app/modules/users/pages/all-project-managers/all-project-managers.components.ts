import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SideViewComponent, SideViewService, SvpButtonModule, SvpTypographyModule, SvpUtilityModule } from "@svp-components";
import { NxDropdownModule } from "@svp-directives";
import { AngularSvgIconModule } from "angular-svg-icon";
import { AddPmComponent } from "../../components/add-pm/add-pm.component";
import { UserService } from "@svp-api-services";
import { ProjectManagerModel, Result } from "@svp-models";
import { NotificationService } from "@svp-services";

@Component({
  selector: 'app-project-managers',
  templateUrl: './all-project-managers.components.html',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    SvpButtonModule,
    SvpTypographyModule,
    SvpUtilityModule,
    CommonModule,
    NxDropdownModule,
    FormsModule,
    SideViewComponent
  ],
})
export class AllProjectManagersComponent implements OnInit {

  sideViewService = inject(SideViewService);
  userService = inject(UserService);
  notify = inject(NotificationService);
  
  allUsers: ProjectManagerModel[] = [];

  ngOnInit(): void {
    console.log('showing all project managers')
    this.loadProjectManagers();

    // TODO: remove the line below
      this.sideViewService.showComponent(AddPmComponent);
  }

  // load all project managers
  loadProjectManagers(): void {
    this.notify.showLoader();
    
    this.userService.listProjectManagers().subscribe((res: Result<ProjectManagerModel[]>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.allUsers = res.content ?? [];
      }
      else {
        this.notify.timedErrorMessage('Unable to retrieve project managers', res.message);
      }
    });
  }
  
  viewUserDetails(uid: string) {
    console.log('Viewing user details', uid)
  }

  addNewPM(): void {
    this.sideViewService.showComponent(AddPmComponent);
  }
  
  async suspendUser(user: ProjectManagerModel): Promise<void> {
    const confirmed = await this.notify.confirmAction('Are you sure you want to suspend this user?');
    if (!confirmed) return;

    this.notify.showLoader();
    this.userService.suspendUser(user.uid).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('User suspended successfully');
        user.isActive = false;
      }
      else {
        this.notify.timedErrorMessage('Unable to suspend user', res.message);
      }
    });
  }

  async activateUser(user: ProjectManagerModel): Promise<void> {
    const confirmed = await this.notify.confirmAction('Are you sure you want to activate this user?');
    if (!confirmed) return;

    this.notify.showLoader();
    this.userService.activateUser(user.uid).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('User activated successfully');
        user.isActive = true;
      }
      else {
        this.notify.timedErrorMessage('Unable to activate user', res.message);
      }
    });
  }
}