export class PagingRequestModel {
  pageIndex: number = 1;
  pageSize: number = 15;
  searchQuery: string | null = null;
  // sortColumn: string;
  // sortDirection: string;
}