export interface TaskCommentModel {
  id: number;
  parentId: number;
  fullName: string;
  message: string;
  createdAt: string;
  createdByUid: string;
  children: TaskCommentModel[];
}
