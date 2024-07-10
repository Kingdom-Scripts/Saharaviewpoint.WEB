import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { ProjectTaskApprovalComponent } from './pages/project-task-approval/project-task-approval';

const routes: Routes = [{ path: 'approvals/project-task-setup', component: ProjectTaskApprovalComponent, title: 'Project Task Setup Approvals'}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ApprovalsModule {}
