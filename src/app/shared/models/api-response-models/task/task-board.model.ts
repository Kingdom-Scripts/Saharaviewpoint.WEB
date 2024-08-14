export interface TaskBoardModel {
  id: number;
  epic: string | null;
  type: string;
  status: string;
  summary: string;
  createdAt: Date;
  dueDate: string;
  order: number;
}
