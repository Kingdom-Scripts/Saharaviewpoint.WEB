import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthDataModel, ProjectManagerModel, Result, UserModel } from '@svp-models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  http = inject(HttpClient);

  listProjectManagers(): Observable<Result<ProjectManagerModel[]>> {
    return this.http.get<Result<ProjectManagerModel[]>>(`users/project-managers`);
  }

  inviteProjectManager(param: any): Observable<Result<string>> {
    return this.http.post<Result<string>>(`users/project-managers/invite`, param);
  }

  acceptInvitation(param: any): Observable<Result<AuthDataModel>> {
    return this.http.post<Result<AuthDataModel>>(`accept-invitation`, param);
  }
}