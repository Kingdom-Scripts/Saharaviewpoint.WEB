import { PagingRequestModel } from "../paging-request.model";

export class TaskSearchModel extends PagingRequestModel {
  projectId: number = 0;
  statuses?: string[] | null = null;
  types?: string[] | null = null;
}