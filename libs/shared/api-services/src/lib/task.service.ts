import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, switchMap } from 'rxjs';
import { TaskModel, TaskSearchModel, TaskStatusEnum, Result } from '@svp-models';
import { NotificationService } from '../../../services/src/lib/notification.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  projectStatusEnum = new TaskStatusEnum();

  searchParam = new TaskSearchModel();
  private _searchParams$ = new Subject<TaskSearchModel>;
  allTasks: Subject<TaskModel[]> = new Subject<TaskModel[]>();

  constructor(private http: HttpClient, private notify: NotificationService) {
    // configure searchTerm$
    this._searchParams$
      .pipe(
        switchMap(term => {
          // this.searchParams.searchQuery = term;
          this.notify.showLoader();
          return this.listTasks(term);
        })
      )
      .subscribe(
        async (res: Result<TaskModel[]>) => {
          this.notify.hideLoader();

          if (res.success) {
            let data = res.content ?? [];
            this.allTasks.next(data);
          }
          else {
            this.notify.timedErrorMessage(res.title, res.message);
          }
        }
      )
  }

  // #region PROJECTS
  searchTasks(searchTerm: string): void {
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
  
  listTasks(param?: TaskSearchModel): Observable<Result<TaskModel[]>> {
    if (param == null) {
      param = new TaskSearchModel();
    }
    
    let query = `searchQuery=${param.searchQuery || ''}
      &status=${param.status || ''}
      &startDueDate=${param.startDueDate || ''}
      &endDueDate=${param.endDueDate || ''}
      &priorityOnly=${param.priorityOnly}`;
    
    return this.http.get<Result<TaskModel[]>>(`projects?${query}`);
  }  
  // #endregion
}
