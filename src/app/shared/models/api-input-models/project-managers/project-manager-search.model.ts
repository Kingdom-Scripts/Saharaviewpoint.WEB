import { PagingRequestModel } from "../paging-request.model";

export class ProjectManagerSearchModel extends PagingRequestModel {
  isActiveOnly?: boolean;
  isInactiveOnly?: boolean;
  dateJoinedStart?: Date;
  dateJoinedEnd?: Date;
}