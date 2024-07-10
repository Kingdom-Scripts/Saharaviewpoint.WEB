import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PagingRequestModel, Result } from '@svp-models';
import { Observable } from 'rxjs';
import { ProjectTaskApprovalModel } from '../models/api-response-models/approvals/project-task-approval.model';

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  http = inject(HttpClient);

  sendProjectTasksForApproval(projectId: number): Observable<Result<ProjectTaskApprovalModel>> {
    return this.http.post<Result<ProjectTaskApprovalModel>>(`approvals/projects/${projectId}/task-setups`, {});
  }

  sendProjectTaskApprovalReminder(projectId: number, approvalId: number): Observable<Result<string>> {
    return this.http.post<Result<string>>(`approvals/projects/${projectId}/task-setups/${approvalId}/send-reminder`, {});
  }

  getProjectTaskApproval(projectId: number): Observable<Result<ProjectTaskApprovalModel>> {
    return this.http.get<Result<ProjectTaskApprovalModel>>(`approvals/projects/${projectId}/task-setups`);
  }

  approveProjectTask(projectId: number, approvalId: number, param: {status: boolean, remark: string}): Observable<Result<ProjectTaskApprovalModel>> {
    return this.http.post<Result<ProjectTaskApprovalModel>>(`approvals/projects/${projectId}/task-setups/${approvalId}/approve`, param);
  }

  listAllProjectTaskApprovals(param: PagingRequestModel): Observable<Result<ProjectTaskApprovalModel[]>> {
    const query = `pageIndex=${param.pageIndex}
        &pageSize=${param.pageSize}
        ${param.searchQuery ? `&searchQuery=${param.searchQuery}` : ''}`;

    return this.http.get<Result<ProjectTaskApprovalModel[]>>(`approvals/projects/task-setups?${query}`);
  }
}
