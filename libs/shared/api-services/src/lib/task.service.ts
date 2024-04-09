import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, switchMap } from 'rxjs';
import { TaskModel, TaskSearchModel, TaskStatusEnum, Result } from '@svp-models';
import { NotificationService } from '../../../services/src/lib/notification.service';
import { UrlSerializer } from '@angular/router';

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
  
  listTasks(param: TaskSearchModel): Observable<Result<TaskModel[]>> {
    let query = `projectId=${param.projectId}
      ${param.searchQuery ? `&searchQuery=${param.searchQuery}` : ''}
      ${param.status ? `&status=${param.status}` : ''}`;

    
    return this.http.get<Result<TaskModel[]>>(`tasks?${query}`, );
  }  
  
  createTask(param: any): Observable<Result<TaskModel>> {
    return this.http.post<Result<TaskModel>>('tasks', param);
  }

  getTask(taskId: number): Observable<Result<TaskModel>> {
    return this.http.get<Result<TaskModel>>(`tasks/${taskId}`);
  }
}
