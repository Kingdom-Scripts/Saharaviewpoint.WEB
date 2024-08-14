import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MaxInputLengthComponent } from '@svp-components';
import { NxDropdownModule } from '@svp-directives';
import { PagingModel, PagingRequestModel, Result } from '@svp-models';
import { UtcToLocalDatePipe } from '@svp-pipes';
import { NotificationService } from '@svp-services';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { ApproveProjectComponent } from 'src/app/modules/project/components/approve-project.component';
import { ApprovalService } from 'src/app/shared/api-services/approval.service';
import { SvpValidationErrorsComponent } from 'src/app/shared/components/input-fields/svp-validation-errors.component';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { SidePanelRef } from 'src/app/shared/components/side-panel/side-panel-ref';
import { SidePanelService } from 'src/app/shared/components/side-panel/side-panel.service';
import { ProjectTaskApprovalModel } from 'src/app/shared/models/api-response-models/approvals/project-task-approval.model';

@Component({
  selector: 'svp-project-task-approval',
  standalone: true,
  templateUrl: 'project-task-approval.html',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    CommonModule,
    PaginationComponent,
    UtcToLocalDatePipe,
    NxDropdownModule,
    RouterLink,
    ReactiveFormsModule,
    SvpValidationErrorsComponent,
    MaxInputLengthComponent,
  ],
})
export class ProjectTaskApprovalComponent implements OnInit, OnDestroy {
  approvalService = inject(ApprovalService);
  notify = inject(NotificationService);
  sidePanel = inject(SidePanelService);
  fb = inject(FormBuilder);

  approvals: ProjectTaskApprovalModel[] = [];
  pagingRequest = new PagingRequestModel();
  isLoading = false;
  searchTerm = '';
  private $searchTerms = new Subject<string>();
  isSearching = false;

  param = new PagingRequestModel();
  paging: PagingModel = new PagingModel();
  // Define a cache for storing loaded pages
  pageCache: Map<number, { data: ProjectTaskApprovalModel[]; paging: PagingModel }> = new Map();

  approveProjectRef!: SidePanelRef;

  selectedApproval: ProjectTaskApprovalModel | null = null;
  remarkModalVisible = false;
  taskApprovalForm: FormGroup = this.fb.group({
    status: [false],
    remark: [''],
  });

  ngOnInit(): void {
    this.loadApprovals(true);
    this.configureSearch();
  }

  loadApprovals(clearCache: boolean): void {
    if (clearCache) this.pageCache.clear();

    // Check if the page is already loaded
    if (this.pageCache.has(this.param.pageIndex)) {
      const cachedPage = this.pageCache.get(this.param.pageIndex);
      if (!cachedPage) return;
      this.approvals = cachedPage.data;
      this.paging = cachedPage.paging;
      return;
    }

    this.notify.showLoader();
    this.approvalService.listAllProjectTaskApprovals(this.param).subscribe((res: Result<ProjectTaskApprovalModel[]>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.approvals = res.content ?? [];

        // Update the cache with the new data
        this.paging = res.paging ?? new PagingModel();
        this.pageCache.set(this.param.pageIndex, { data: this.approvals, paging: this.paging });
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  goToPage(pageIndex: number): void {
    this.param.pageIndex = pageIndex;
    this.loadApprovals(false);
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.param.pageIndex = 1;
    this.param.pageSize = itemsPerPage;
    this.loadApprovals(true);
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
          return this.approvalService.listAllProjectTaskApprovals(this.param);
        }),
      )
      .subscribe((res: Result<ProjectTaskApprovalModel[]>) => {
        if (res.success) {
          this.approvals = res.content ?? [];
          this.paging = res.paging ?? new PagingModel();
          this.pageCache.set(this.param.pageIndex, { data: this.approvals, paging: this.paging });
          this.isSearching = false;
        } else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      });
  }

  viewProjectDetails(id: number): void {
    const inputs = { id: id };
    this.approveProjectRef = this.sidePanel.open(ApproveProjectComponent, {
      inputs: inputs,
      size: 'large',
    });
  }

  approveProjectTask(item: ProjectTaskApprovalModel): void {
    this.taskApprovalForm.patchValue({ status: true, remark: '' });

    this.saveApproval(item);
  }

  promptDeclinationModal(item: ProjectTaskApprovalModel): void {
    this.selectedApproval = item;
    this.remarkModalVisible = true;
    this.taskApprovalForm.reset();
    this.taskApprovalForm.patchValue({ status: false });
    this.taskApprovalForm.get('remark')?.setValidators([Validators.required, Validators.minLength(5), Validators.maxLength(500)]);
  }

  declineRequest(): void {
    if (this.taskApprovalForm.invalid) {
      this.taskApprovalForm.markAllAsTouched();
      return;
    }

    const item = this.selectedApproval;
    if (!item) return;

    this.saveApproval(item);
  }

  saveApproval(item: ProjectTaskApprovalModel): void {
    const param = this.taskApprovalForm.value;

    this.notify.showLoader();
    this.approvalService.approveProjectTask(item.projectId, item.id, param).subscribe((res: Result<ProjectTaskApprovalModel>) => {
      this.notify.hideLoader();
      if (res.success) {
        this.notify.timedSuccessMessage(res.title, res.message);
        item.isFulfilled = true;
        item.status = param.status;
        item.fulfilledById = res.content?.fulfilledById ?? null;
        item.fulfilledByName = res.content?.fulfilledByName ?? null;
        item.fulfilledOn = res.content?.fulfilledOn ?? null;
        item.remark = res.content?.remark ?? null;

        this.remarkModalVisible = false;
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.approveProjectRef) this.approveProjectRef.close();
  }
}
