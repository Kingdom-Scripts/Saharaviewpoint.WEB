import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ClientModel } from "../models/api-response-models/client/client.model";
import { ClientSearchModel } from "../models/api-input-models/client/client-search.model";
import { Result } from "@svp-models";

@Injectable({ providedIn: 'root' })
export class ClientService {
  http = inject(HttpClient);

  listClients(param: ClientSearchModel): Observable<Result<ClientModel[]>> {
    let query = `pageIndex=${param.pageIndex}&pageSize=${param.pageSize}`;

    if (param.searchQuery) query += `&searchQuery=${param.searchQuery}`;
    if (param.isActiveOnly) query += '&isActiveOnly=true';
    if (param.isInactiveOnly) query += '&isInactiveOnly=true';
    if (param.dateJoinedStart) query += `&dateJoinedStart=${param.dateJoinedStart}`;
    if (param.dateJoinedEnd) query += `&dateJoinedEnd=${param.dateJoinedEnd}`;
    
    return this.http.get<Result<ClientModel[]>>(`clients?${query}`);
  }

  deactivateClient(uid: string): Observable<Result<string>> {
    return this.http.patch<Result<string>>(`clients/${uid}/deactivate`, {});
  }

  activateClient(uid: string): Observable<Result<string>> {
    return this.http.patch<Result<string>>(`clients/${uid}/activate`, {});
  }
}