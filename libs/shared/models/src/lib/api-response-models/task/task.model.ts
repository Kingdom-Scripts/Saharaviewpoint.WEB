import { DocumentModel } from "../document.model";
import { ProjectModel } from "../project/project.model";
import { ReferenceUserModel } from "../reference-user.model";

export interface TaskModel {
  id: number;
  type: string;
  summary: string;
  description: string;
  status: string;
  createdAt: string;
  expectedStartDate: string;
  dueDate: string;
  projectId: number,
  project: ProjectModel;
  createdById: number,
  createdBy: ReferenceUserModel;
  attachments: DocumentModel[];
  order: 0
}