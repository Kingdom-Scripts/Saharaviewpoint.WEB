export interface TaskBoardModel {
  id: number;
  epic: string | null;
  type: string;
  status: string;
  summary: string;
  createdAt: string;
  dueDate: string;
  order: number;
}