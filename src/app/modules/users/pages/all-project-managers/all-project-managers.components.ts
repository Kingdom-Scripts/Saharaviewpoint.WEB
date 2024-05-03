import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SideViewComponent, SideViewService, SvpButtonModule, SvpTypographyModule, SvpUtilityModule } from "@svp-components";
import { NxDropdownModule } from "@svp-directives";
import { AngularSvgIconModule } from "angular-svg-icon";
import { AddPmComponent } from "../../components/add-pm/add-pm.component";
import { UserService } from "@svp-api-services";
import { ProjectManagerModel, Result, UserModel } from "@svp-models";
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
  //  = [
  //   {
  //     id: 1,
  //     name: 'John Doe',
  //     email: 'john@doe.com',
  //     noOfProjects: 5,
  //     status: 'Active'
  //   },
  //   {
  //     id: 2,
  //     name: 'Doe Mary',
  //     email: 'doe@mary.com',
  //     noOfProjects: 2,
  //     status: 'Active'
  //   },
  //   {
  //     id: 3,
  //     name: 'John Doe',
  //     email: 'deee@dooo.com',
  //     noOfProjects: 10,
  //     status: 'Inactive'
  //   }
  // ]

  ngOnInit(): void {
    console.log('showing all project managers')
    this.loadProjectManagers();

      // this.sideViewService.showComponent(AddPmComponent);
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
}