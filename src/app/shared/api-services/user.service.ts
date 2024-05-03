/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, switchMap } from 'rxjs';
import { AuthDataModel, ProjectManagerModel, ProjectManagerSearchModel, Result } from '@svp-models';
import { NotificationService } from '@svp-services';

@Injectable({
  providedIn: 'root'
})
export class UserService {
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

    const query = `searchQuery=${param.searchQuery ?? ''}`
    
    return this.http.get<Result<ProjectManagerModel[]>>(`users/project-managers?${query}`);
  }

  inviteProjectManager(param: any): Observable<Result<string>> {
    return this.http.post<Result<string>>(`users/project-managers/invite`, param);
  }

  acceptInvitation(param: any): Observable<Result<AuthDataModel>> {
    return this.http.post<Result<AuthDataModel>>(`users/accept-invitation`, param);
  }
}