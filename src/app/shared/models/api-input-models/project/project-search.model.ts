export class ProjectSearchModel {
  searchQuery: string | null = null;
  status: string | null = null;
  startDueDate: Date | null  = null;
  endDueDate: Date | null = null;
  priorityOnly: boolean = false;
}