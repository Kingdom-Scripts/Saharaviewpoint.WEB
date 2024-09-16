import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SideViewComponent, SideViewService, SvpButtonModule, SvpTypographyModule, SvpUtilityModule } from '@svp-components';
import { NxDropdownModule } from '@svp-directives';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AddPmComponent } from '../../components/add-pm/add-pm.component';
import { ProjectManagerService } from '@svp-api-services';
import { PagingModel, ProjectManagerModel, Result } from '@svp-models';
import { NotificationService } from '@svp-services';
import { ProjectManagerSearchModel } from 'src/app/shared/models/api-input-models/project-managers/project-manager-search.model';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';
import { UtcToLocalDatePipe } from '@svp-pipes';

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
    SideViewComponent,
    PaginationComponent,
    NgSelectModule,
    UtcToLocalDatePipe,
  ],
})
export class AllProjectManagersComponent implements OnInit {
  sideViewService = inject(SideViewService);
  projectManagerService = inject(ProjectManagerService);
  notify = inject(NotificationService);
  param: ProjectManagerSearchModel = new ProjectManagerSearchModel();
  paging: PagingModel = new PagingModel();

  allUsers: ProjectManagerModel[] = [];

  searchTerm = '';
  private $searchTerms = new Subject<string>();
  isSearching = false;
  activeOptions = ['All', 'Active Only', 'Inactive Only'];
  selectedActiveState = 'All';
  // Define a cache for storing loaded pages
  pageCache: Map<number, { data: ProjectManagerModel[]; paging: PagingModel }> = new Map();

  ngOnInit(): void {
    this.loadProjectManagers(true);
    this.configureSearch();
  }

  // load all project managers
  loadProjectManagers(clearCache: boolean): void {
    if (clearCache) this.pageCache.clear();

    // Check if the page is already loaded
    if (this.pageCache.has(this.param.pageIndex)) {
      const cachedPage = this.pageCache.get(this.param.pageIndex);
      if (!cachedPage) return;
      this.allUsers = cachedPage.data;
      this.paging = cachedPage.paging;
      return;
    }

    this.notify.showLoader();
    this.projectManagerService.listProjectManagers(this.param).subscribe((res: Result<ProjectManagerModel[]>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.allUsers = res.content ?? [];

        // Update the cache with the new data
        this.paging = res.paging ?? new PagingModel();
        this.pageCache.set(this.param.pageIndex, { data: this.allUsers, paging: this.paging });
      } else {
        this.notify.timedErrorMessage('Unable to retrieve project managers', res.message);
      }
    });
  }

  goToPage(pageIndex: number): void {
    this.param.pageIndex = pageIndex;
    this.loadProjectManagers(false);
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.param.pageIndex = 1;
    this.param.pageSize = itemsPerPage;
    this.loadProjectManagers(true);
  }

  // TODO: Implement viewing user details
  viewUserDetails(uid: string) {
    console.log('Viewing user details', uid);
  }

  searchChanged(): void {
    this.$searchTerms.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChanged();
  }

  configureSearch(): void {
    this.$searchTerms
      .pipe(
        debounceTime(250),
        switchMap((term: string) => {
          this.param.pageIndex = 1;
          this.param.searchQuery = term;
          this.pageCache.clear();
          this.isSearching = true;
          return this.projectManagerService.listProjectManagers(this.param);
        }),
      )
      .subscribe((res: Result<ProjectManagerModel[]>) => {
        if (res.success) {
          this.allUsers = res.content ?? [];
          this.paging = res.paging ?? new PagingModel();
          this.pageCache.set(this.param.pageIndex, { data: this.allUsers, paging: this.paging });
          this.isSearching = false;
        } else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      });
  }

  filterByActiveState(): void {
    this.param.pageIndex = 1;
    if (this.selectedActiveState === 'All') {
      this.param.isActiveOnly = false;
      this.param.isInactiveOnly = false;
    }
    this.param.isActiveOnly = this.selectedActiveState === 'Active Only';
    this.param.isInactiveOnly = this.selectedActiveState === 'Inactive Only';
    this.loadProjectManagers(true);
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedActiveState = 'All';
    this.param = new ProjectManagerSearchModel();
    this.loadProjectManagers(true);
  }

  addNewPM(): void {
    this.sideViewService.showComponent(AddPmComponent);
  }

  async suspendUser(user: ProjectManagerModel): Promise<void> {
    const confirmed = await this.notify.confirmAction('Are you sure you want to suspend this user?');
    if (!confirmed) return;

    this.notify.showLoader();
    this.projectManagerService.suspendUser(user.uid).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('User suspended successfully');
        user.isActive = false;
      } else {
        this.notify.timedErrorMessage('Unable to suspend user', res.message);
      }
    });
  }

  async activateUser(user: ProjectManagerModel): Promise<void> {
    const confirmed = await this.notify.confirmAction('Are you sure you want to activate this user?');
    if (!confirmed) return;

    this.notify.showLoader();
    this.projectManagerService.activateUser(user.uid).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('User activated successfully');
        user.isActive = true;
      } else {
        this.notify.timedErrorMessage('Unable to activate user', res.message);
      }
    });
  }
}
