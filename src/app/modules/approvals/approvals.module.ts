import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { ProjectTaskApprovalComponent } from './pages/project-task-approval/project-task-approval';
import { RoleEnum } from '@svp-models';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'approvals/project-task-setup',
    component: ProjectTaskApprovalComponent,
    title: 'Project Task Setup Approvals',
    canActivate: [AuthGuard],
    data: { roles: [RoleEnum.SVP_ADMIN, RoleEnum.SUPER_ADMIN] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ApprovalsModule {}
