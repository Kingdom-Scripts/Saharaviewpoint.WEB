import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SideViewComponent, SvpButtonModule, SvpTypographyModule, SvpUtilityModule } from '@svp-components';
import { NxDropdownModule } from '@svp-directives';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { PagingModel, Result } from '@svp-models';
import { NotificationService } from '@svp-services';
import { NgSelectModule } from '@ng-select/ng-select';
import { ClientService } from 'src/app/shared/api-services/client.service';
import { ClientSearchModel } from 'src/app/shared/models/api-input-models/client/client-search.model';
import { ClientModel } from 'src/app/shared/models/api-response-models/client/client.model';
import { UtcToLocalDatePipe } from '@svp-pipes';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { Subject, debounceTime, switchMap } from 'rxjs';

@Component({
  selector: 'app-clients',
  templateUrl: './all-clients.components.html',
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
    NgSelectModule,
    UtcToLocalDatePipe,
    PaginationComponent,
  ],
})
export class AllClientsComponent implements OnInit {
  clientService = inject(ClientService);
  notify = inject(NotificationService);

  allClients: ClientModel[] = [];
  searchTerm = '';
  private $searchTerms = new Subject<string>();
  isSearching = false;
  activeOptions = ['All', 'Active Only', 'Inactive Only'];
  selectedActiveState = 'All';
  param: ClientSearchModel = new ClientSearchModel();
  paging: PagingModel = new PagingModel();

  // Define a cache for storing loaded pages
  pageCache: Map<number, { data: ClientModel[]; paging: PagingModel }> = new Map();

  ngOnInit(): void {
    this.loadClients(true);
    this.configureSearch();
    return;
  }

  // load all project managers
  loadClients(clearCache: boolean): void {
    console.log('Loading clients: ', this.param);

    if (clearCache) this.pageCache.clear();
    
    // Check if the page is already loaded
    if (this.pageCache.has(this.param.pageIndex)) {
      const cachedPage = this.pageCache.get(this.param.pageIndex);
      if (!cachedPage) return;
      this.allClients = cachedPage.data;
      this.paging = cachedPage.paging;
      return;
    }

    this.notify.showLoader();
    this.clientService.listClients(this.param).subscribe((res: Result<ClientModel[]>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.allClients = res.content ?? [];
        this.paging = res.paging ?? new PagingModel();

        // Update the cache with the new data
        this.pageCache.set(this.param.pageIndex, { data: this.allClients, paging: this.paging });
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  goToPage(pageIndex: number): void {
    this.param.pageIndex = pageIndex;
    this.loadClients(false);
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.param.pageIndex = 1;
    this.param.pageSize = itemsPerPage;
    this.loadClients(true);
  }

  searchChanged(): void {
    this.$searchTerms.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChanged();
  }

  configureSearch(): void {
    this.$searchTerms .pipe(
      debounceTime(250),
      switchMap((term: string) => {
        console.log('Search term: ', term);
        this.param.pageIndex = 1;
        this.param.searchQuery = term;
        this.pageCache.clear();
        this.isSearching = true;
        return this.clientService.listClients(this.param);
      })
    ).subscribe((res: Result<ClientModel[]>) => {
      if (res.success) {
        this.allClients = res.content ?? [];
        this.paging = res.paging ?? new PagingModel();
        this.pageCache.set(this.param.pageIndex, { data: this.allClients, paging: this.paging });
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
    this.loadClients(true);
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedActiveState = 'All';
    this.param = new ClientSearchModel();
    this.loadClients(true);
  }

  async deactivateClient(client: ClientModel): Promise<void> {
    const confirmed = await this.notify.confirmAction('Are you sure you want to deactivate this client?');
    if (!confirmed) return;

    this.notify.showLoader();
    this.clientService.deactivateClient(client.uid).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('Client deactivated successfully');
        client.isActive = false;
      } else {
        this.notify.timedErrorMessage('Unable to suspend client', res.message);
      }
    });
  }

  async activateClient(client: ClientModel): Promise<void> {
    const confirmed = await this.notify.confirmAction('Are you sure you want to activate this client?');
    if (!confirmed) return;

    this.notify.showLoader();
    this.clientService.activateClient(client.uid).subscribe((res: Result<string>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage('Client activated successfully');
        client.isActive = true;
      } else {
        this.notify.timedErrorMessage('Unable to activate client', res.message);
      }
    });
  }
}
