export class TaskSearchModel {
  projectId: number = 0;
  searchQuery: string | null = null;
  statuses: string[] | null = null;
  types: string[] | null = null;
}