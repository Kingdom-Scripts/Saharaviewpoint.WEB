import { PagingRequestModel } from "../paging-request.model";

export class ClientSearchModel extends PagingRequestModel {
  isActiveOnly?: boolean;
  isInactiveOnly?: boolean;
  dateJoinedStart?: Date;
  dateJoinedEnd?: Date;
}