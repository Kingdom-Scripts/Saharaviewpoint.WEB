export interface ProjectLogModel {
  description: string;
  createdAt: string;
  previousState: string;
  currentState: string;
  taskId: number;
  remark: string;
}