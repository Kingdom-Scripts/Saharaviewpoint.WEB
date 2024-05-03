/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, switchMap } from 'rxjs';
import { ProjectModel, ProjectSearchModel, ProjectStatusEnum, ProjectTypeModel, Result } from '@svp-models';
import { NotificationService } from '@svp-services';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  projectStatusEnum = new ProjectStatusEnum();

  searchParam = new ProjectSearchModel();
  private _searchParams$ = new Subject<ProjectSearchModel>;
  allProjects: Subject<ProjectModel[]> = new Subject<ProjectModel[]>();

  constructor(private http: HttpClient, private notify: NotificationService) {
    // configure searchTerm$
    this._searchParams$
      .pipe(
        switchMap(term => {
          // this.searchParams.searchQuery = term;
          this.notify.showLoader();
          return this.listProjects(term);
        })
      )
      .subscribe(
        async (res: Result<ProjectModel[]>) => {
          this.notify.hideLoader();

          if (res.success) {
            const data = res.content ?? [];
            this.allProjects.next(data);
          }
          else {
            this.notify.timedErrorMessage(res.title, res.message);
          }
        }
      )
  }

  // #region PROJECTS
  searchProjects(searchTerm: string): void {
    this.searchParam.searchQuery = searchTerm;
    this.triggerFilterChange();
  }

  filterByStatus(status: string | null): void {
    this.searchParam.status = status;
    this.triggerFilterChange();
  }

  triggerFilterChange(): void {    
    this._searchParams$.next(this.searchParam);
  }
  
  listProjects(param?: ProjectSearchModel): Observable<Result<ProjectModel[]>> {
    if (param == null) {
      param = new ProjectSearchModel();
    }
    
    const query = `searchQuery=${param.searchQuery || ''}
      &status=${param.status || ''}
      &startDueDate=${param.startDueDate || ''}
      &endDueDate=${param.endDueDate || ''}
      &priorityOnly=${param.priorityOnly}`;
    
    return this.http.get<Result<ProjectModel[]>>(`projects?${query}`);
  }

  createProject(param: FormData): Observable<Result<ProjectModel>> {
    return this.http.post<Result<ProjectModel>>(`projects`, param);
  }

  approveProject(id: number, assigneeUid: string) {
    return this.http.post<Result<ProjectModel>>(`projects/${id}/approve/${assigneeUid}`, null);
  }

  getProject(id: number): Observable<Result<ProjectModel>> {
    return this.http.get<Result<ProjectModel>>(`projects/${id}`);
  }

  updateProject(id: number, param: any): Observable<Result<ProjectModel>> {
    return this.http.put<Result<ProjectModel>>(`projects/${id}`, param);
  }

  deleteProject(id: number): Observable<Result<string>> {
    return this.http.delete<Result<string>>(`projects/${id}`);
  }

  reAssignProject(id: number, param: any): Observable<Result<string>> {
    return this.http.post<Result<string>>(`projects/${id}/reassign`, param);
  }

  countProjects(): Observable<Result<number>> {
    return this.http.get<Result<number>>(`projects/count`);
  }
  // #endregion

  // #region TYPES
  listTypes(searchTerm?: string): Observable<Result<ProjectTypeModel[]>> {
    const query = searchTerm ? `?searchTerm=${searchTerm}` : '';
    return this.http.get<Result<ProjectTypeModel[]>>(`projects/types${query}`);
  }

  addType(param: any): Observable<Result<ProjectTypeModel>> {
    return this.http.post<Result<ProjectTypeModel>>(`projects/types`, param);
  }

  deleteType(id: number): Observable<Result<string>> {
    return this.http.delete<Result<string>>(`projects/types/${id}`);
  }
  // #endregion
}
