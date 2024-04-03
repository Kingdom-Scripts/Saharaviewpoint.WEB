import { DocumentModel } from "../document.model";
import { ReferenceUserModel } from "../reference-user.model";

export interface ProjectModel {
  id: number;
  title: string;
  description: string;
  status: string;
  startDate: Date;
  dueDate: Date;
  isPriority: boolean;
  order: number;
  assignedId?: number;
  designId?: number;
  design?: DocumentModel;
  assignee?: ReferenceUserModel;
  createdBy?: ReferenceUserModel;
}