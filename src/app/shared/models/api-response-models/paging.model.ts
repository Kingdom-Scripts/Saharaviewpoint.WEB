export class PagingModel {
  pageIndex: number = 1;
  pageSize: number = 1;
  totalItems: number = 0;
  totalPages: number = 1;
  hasNextPage: boolean = false;
  hasPreviousPage: boolean = false;
}