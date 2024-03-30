import { ReferenceUserModel } from "../reference-user.model";

export interface TaskModel {
  id: number;
  type: string;
  summary: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  dueDate: Date;
  reporter: ReferenceUserModel;
}