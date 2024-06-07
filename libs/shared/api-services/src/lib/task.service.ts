import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, map, switchMap } from 'rxjs';
import { TaskModel, TaskSearchModel, TaskStatusEnum, Result, DocumentModel, TaskLogModel, PagingRequestModel, TaskCommentModel } from '@svp-models';
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

  listAttachments(taskId: number): Observable<Result<DocumentModel[]>> {
    return this.http.get<Result<DocumentModel[]>>(`tasks/${taskId}/attachments`);
  }

  uploadFile(taskId: number, file: File): Observable<number | undefined> {
    const formData = new FormData();
    formData.append('file', file);

    const request = new HttpRequest('POST', `tasks/${taskId}/attachments`, formData, {
        reportProgress: true, // Enable progress tracking,
        responseType: 'json', // Ensure response is parsed as JSON
        
      });
      
    let count = 1;
    return this.http.post(`tasks/${taskId}/attachments`, formData, {
      reportProgress: true, // Enable progress tracking
      observe: 'events', // Enable event tracking
      responseType: 'json' // Ensure response is parsed as JSON
    }).pipe(
      map((event: HttpEvent<Result<any>>) => {
        console.log(`--> Event: ${count}`, event);
        count++;
          if (event.type === HttpEventType.UploadProgress) {
              const percentDone = Math.round((100 * event.loaded) / event.total!);
              return percentDone;
          } else if (event.type === HttpEventType.Response) {
              // Handle response from server
              return 100; // Upload complete
          } else {
              return undefined;
          }
      })
    );

    // return this.http.request(request).pipe(
    //     map(event => {
    //       console.log(`--> Event: ${count}`, event);
    //       count++;
    //         if (event.type === HttpEventType.UploadProgress) {
    //             const percentDone = Math.round((100 * event.loaded) / event.total!);
    //             return percentDone;
    //         } else if (event.type === HttpEventType.Response) {
    //             // Handle response from server
    //             return 100; // Upload complete
    //         } else {
    //             return undefined;
    //         }
    //     })
    // );
  }

  deleteAttachment(taskId: number, documentId: number): Observable<Result<any>> {
    return this.http.delete<Result<any>>(`tasks/${taskId}/attachments/${documentId}`);
  }

  listLogs(taskId: number, param: PagingRequestModel): Observable<Result<TaskLogModel[]>> {
    let query = `pageIndex=${param.pageIndex}&pageSize=${param.pageSize}`;
    
    return this.http.get<Result<TaskLogModel[]>>(`tasks/${taskId}/logs?${query}`);
  }

  addComment(taskId: number, param: any): Observable<TaskCommentModel> {
    return this.http.post<TaskCommentModel>(`tasks/${taskId}/comments`, param);
  }

  removeComment(taskId: number, commentId: number): Observable<Result<any>> {
    return this.http.delete<Result<any>>(`tasks/${taskId}/comments/${commentId}`);
  }

  listComments(taskId: number, param: PagingRequestModel): Observable<Result<TaskCommentModel[]>> {
    let query = `pageIndex=${param.pageIndex}&pageSize=${param.pageSize}`;
    if (param.searchQuery && param.searchQuery != '') query += `&searchQuery=${param.searchQuery}`;
    
    return this.http.get<Result<TaskCommentModel[]>>(`tasks/${taskId}/comments?${query}`);
  }
}
