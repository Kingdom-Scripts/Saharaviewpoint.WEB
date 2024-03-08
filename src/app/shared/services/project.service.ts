import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, switchMap } from 'rxjs';
import { Result } from '../models/api-response-models/Result';
import { ProjectTypeModel } from '../models/api-response-models/project/project-type.model';
import { ProjectModel } from '../models/api-response-models/project/project.model';
import { ProjectSearchModel } from '../models/api-input-models/project/project-search.model';
import { ProjectStatusEnum } from '../enums/ProjectStatusEnum';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  projectStatusEnum = ProjectStatusEnum;

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
            let data = res.content ?? [];
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
    console.log('--> triggerFilterChange', this.searchParam);
    
    this._searchParams$.next(this.searchParam);
  }
  
  listProjects(param?: ProjectSearchModel): Observable<Result<ProjectModel[]>> {
    if (param == null) {
      param = new ProjectSearchModel();
    }
    
    let query = `searchQuery=${param.searchQuery || ''}
      &status=${param.status || ''}
      &startDueDate=${param.startDueDate || ''}
      &endDueDate=${param.endDueDate || ''}
      &priorityOnly=${param.priorityOnly}`;
    
    return this.http.get<Result<ProjectModel[]>>(`projects?${query}`);
  }

  createProject(param: FormData): Observable<Result<ProjectModel>> {
    return this.http.post<Result<ProjectModel>>(`projects`, param);
  }

  getProject(id: number): Observable<Result<ProjectModel>> {
    return this.http.get<Result<ProjectModel>>(`projects/${id}`);
  }

  updateProject(id: number, param: any): Observable<Result<ProjectModel>> {
    return this.http.put<Result<ProjectModel>>(`projects/${id}`, param);
  }

  deleteProject(id: number): Observable<Result<any>> {
    return this.http.delete<Result<any>>(`projects/${id}`);
  }

  reAssignProject(id: number, param: any): Observable<Result<any>> {
    return this.http.post<Result<any>>(`projects/${id}/reassign`, param);
  }

  countProjects(): Observable<Result<number>> {
    return this.http.get<Result<number>>(`projects/count`);
  }
  // #endregion

  // #region TYPES
  listTypes(searchTerm?: string): Observable<Result<ProjectTypeModel[]>> {
    let query = searchTerm ? `?searchTerm=${searchTerm}` : '';
    return this.http.get<Result<ProjectTypeModel[]>>(`projects/types${query}`);
  }

  addType(param: any): Observable<Result<ProjectTypeModel>> {
    return this.http.post<Result<ProjectTypeModel>>(`projects/types`, param);
  }

  deleteType(id: number): Observable<Result<any>> {
    return this.http.delete<Result<any>>(`projects/types/${id}`);
  }
  // #endregion
}
