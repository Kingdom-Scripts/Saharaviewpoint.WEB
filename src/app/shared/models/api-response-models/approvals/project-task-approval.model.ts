export interface ProjectTaskApprovalModel {
  id: number;
  projectId: number;
  projectTitle: string;
  requestedOn: Date,
  requesterId: number;
  requesterName: string;
  isFulfilled: boolean;
  fulfilledById: number | null;
  fulfilledByName: string | null;
  status: boolean | null;
  fulfilledOn: Date | null;
  remark: string | null;
}