/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map, switchMap } from 'rxjs';
import {
  TaskModel,
  TaskSearchModel,
  TaskStatusEnum,
  Result,
  DocumentModel,
  TaskLogModel,
  PagingRequestModel,
  TaskCommentModel,
  TaskBoardModel,
} from '@svp-models';
import { NotificationService } from '@svp-services';
import { UploadProgressModel } from '../models/api-response-models/upload-progress.model';
import { VideoUploadTokenModel } from '../models/api-response-models/task/video-upload-token.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  projectStatusEnum = TaskStatusEnum;

  searchParam = new TaskSearchModel();
  private _searchParams$ = new Subject<TaskSearchModel>();
  allTasks: Subject<TaskModel[]> = new Subject<TaskModel[]>();

  constructor(private http: HttpClient, private notify: NotificationService) {
    // configure searchTerm$
    this._searchParams$
      .pipe(
        switchMap(term => {
          // this.searchParams.searchQuery = term;
          this.notify.showLoader();
          return this.listTasks(term);
        }),
      )
      .subscribe(async (res: Result<TaskModel[]>) => {
        this.notify.hideLoader();

        if (res.success) {
          const data = res.content ?? [];
          this.allTasks.next(data);
        } else {
          this.notify.timedErrorMessage(res.title, res.message);
        }
      });
  }

  searchTasks(searchTerm: string): void {
    this.searchParam.searchQuery = searchTerm;
    this.triggerFilterChange();
  }

  filterByStatus(statuses: string[] | null): void {
    this.searchParam.statuses = statuses;
    this.triggerFilterChange();
  }

  triggerFilterChange(): void {
    this._searchParams$.next(this.searchParam);
  }

  listTasks(param: TaskSearchModel): Observable<Result<TaskModel[]>> {
    let query = `projectId=${param.projectId}&pageIndex=${param.pageIndex}&pageSize=${param.pageSize}${
      param.searchQuery ? `&searchQuery=${param.searchQuery}` : ''
    }`;

    param.types?.forEach(type => {
      query += `&types=${type}`;
    });

    param.statuses?.forEach(status => {
      query += `&statuses=${status}`;
    });
    return this.http.get<Result<TaskModel[]>>(`tasks?${query}`);
  }

  deleteTask(taskId: number): Observable<Result<string>> {
    return this.http.delete<Result<string>>(`tasks/${taskId}`);
  }

  listBoardTasks(projectId: number, searchTerm: undefined | null | string = undefined): Observable<Result<TaskBoardModel[]>> {
    return this.http.get<Result<TaskBoardModel[]>>(`tasks/${projectId}/board${searchTerm ? `?searchQuery=${searchTerm}` : ''}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeTaskStatus(taskId: number, param: any): Observable<Result<TaskModel>> {
    return this.http.patch<Result<TaskModel>>(`tasks/${taskId}/status`, param);
  }

  createTask(param: any): Observable<Result<TaskModel>> {
    return this.http.post<Result<TaskModel>>('tasks', param);
  }

  getTask(taskId: number): Observable<Result<TaskModel>> {
    return this.http.get<Result<TaskModel>>(`tasks/${taskId}`);
  }

  changeDueDate(taskId: number, param: any): Observable<Result<TaskModel>> {
    return this.http.patch<Result<TaskModel>>(`tasks/${taskId}/due-date`, param);
  }

  listAttachments(taskId: number): Observable<Result<DocumentModel[]>> {
    return this.http.get<Result<DocumentModel[]>>(`tasks/${taskId}/attachments`);
  }

  uploadFile(taskId: number, file: File): Observable<UploadProgressModel | Result<DocumentModel>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post(`tasks/${taskId}/attachments`, formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(map(event => this.getEventMessage(event)));
  }

  private getEventMessage(event: any): UploadProgressModel | Result<DocumentModel> {
    switch (event.type) {
      case HttpEventType.UploadProgress: {
        const percentDone = Math.round((100 * event.loaded) / event.total);
        return { progress: percentDone };
      }

      case HttpEventType.Response: {
        return event.body as Result<DocumentModel>;
      }

      default: {
        return { progress: 0 };
      }
    }
  }

  getVideoUploadToken(): Observable<Result<VideoUploadTokenModel>> {
    return this.http.get<Result<VideoUploadTokenModel>>('tasks/attachments/video-upload-token');
  }

  saveVideoAttachment(taskId: number, param: any): Observable<Result<DocumentModel>> {
    return this.http.post<Result<DocumentModel>>(`tasks/${taskId}/attachments/video`, param);
  }

  deleteAttachment(taskId: number, documentId: number): Observable<Result<string>> {
    return this.http.delete<Result<string>>(`tasks/${taskId}/attachments/${documentId}`);
  }

  listLogs(taskId: number, param: PagingRequestModel): Observable<Result<TaskLogModel[]>> {
    const query = `pageIndex=${param.pageIndex}&pageSize=${param.pageSize}`;

    return this.http.get<Result<TaskLogModel[]>>(`tasks/${taskId}/logs?${query}`);
  }

  addComment(taskId: number, param: any): Observable<TaskCommentModel> {
    return this.http.post<TaskCommentModel>(`tasks/${taskId}/comments`, param);
  }

  removeComment(taskId: number, commentId: number): Observable<Result<string>> {
    return this.http.delete<Result<string>>(`tasks/${taskId}/comments/${commentId}`);
  }

  listComments(taskId: number, param: PagingRequestModel): Observable<Result<TaskCommentModel[]>> {
    let query = `pageIndex=${param.pageIndex}&pageSize=${param.pageSize}`;
    if (param.searchQuery && param.searchQuery != '') query += `&searchQuery=${param.searchQuery}`;

    return this.http.get<Result<TaskCommentModel[]>>(`tasks/${taskId}/comments?${query}`);
  }
}
