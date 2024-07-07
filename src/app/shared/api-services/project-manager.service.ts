/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, switchMap } from 'rxjs';
import { AuthDataModel, ProjectManagerModel, Result } from '@svp-models';
import { NotificationService } from '@svp-services';
import { ProjectManagerSearchModel } from '../models/api-input-models/project-managers/project-manager-search.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectManagerService {
  http = inject(HttpClient);
  notify = inject(NotificationService);

  searchParam = new ProjectManagerSearchModel();
  private _searchParams$ = new Subject<ProjectManagerSearchModel>;
  allProjectManagers: Subject<ProjectManagerModel[]> = new Subject<ProjectManagerModel[]>();

  constructor() {
    // configure searchTerm$
    this._searchParams$
      .pipe(
        switchMap(term => {
          this.notify.showLoader();
          return this.listProjectManagers(term);
        })
      )
      .subscribe(
        async (res: Result<ProjectManagerModel[]>) => {
          this.notify.hideLoader();

          if (res.success) {
            const data = res.content ?? [];
            this.allProjectManagers.next(data);
          }
          else {
            this.notify.timedErrorMessage(res.title, res.message);
          }
        }
      )
  }

  searchProjectManagers(searchTerm: string): void {
    this.searchParam.searchQuery = searchTerm;
    this.triggerFilterChange();
  }

  triggerFilterChange(): void {    
    this._searchParams$.next(this.searchParam);
  }

  listProjectManagers(param?: ProjectManagerSearchModel): Observable<Result<ProjectManagerModel[]>> {
    if (param == null) {
      param = new ProjectManagerSearchModel();
    }

    let query = `pageIndex=${param.pageIndex}&pageSize=${param.pageSize}`;

    if (param.searchQuery) query += `&searchQuery=${param.searchQuery}`;
    if (param.isActiveOnly) query += '&isActiveOnly=true';
    if (param.isInactiveOnly) query += '&isInactiveOnly=true';
    if (param.dateJoinedStart) query += `&dateJoinedStart=${param.dateJoinedStart}`;
    if (param.dateJoinedEnd) query += `&dateJoinedEnd=${param.dateJoinedEnd}`;
    
    return this.http.get<Result<ProjectManagerModel[]>>(`project-managers?${query}`);
  }

  inviteProjectManager(param: any): Observable<Result<string>> {
    return this.http.post<Result<string>>(`project-managers/invite`, param);
  }

  acceptInvitation(param: any): Observable<Result<AuthDataModel>> {
    return this.http.post<Result<AuthDataModel>>(`project-managers/accept-invitation`, param);
  }

  suspendUser(uid: string): Observable<Result<string>> {
    return this.http.patch<Result<string>>(`project-managers/${uid}/suspend`, {});
  }

  activateUser(uid: string): Observable<Result<string>> {
    return this.http.patch<Result<string>>(`project-managers/${uid}/activate`, {});
  }

  checkEmail(email: string): Observable<Result<boolean>> {
    return this.http.get<Result<boolean>>(`project-managers/check-email?email=${email}`);
  }
}