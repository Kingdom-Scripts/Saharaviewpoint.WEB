import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllProjectManagersComponent } from './pages/all-project-managers/all-project-managers.components';
import { AllClientsComponent } from './pages/all-clients/all-clients.components';
import { RoleEnum } from '@svp-models';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'users/project-managers',
    component: AllProjectManagersComponent,
    canActivate: [AuthGuard],
    data: { roles: [RoleEnum.SVP_ADMIN, RoleEnum.SUPER_ADMIN] },
  },
  {
    path: 'users/clients',
    component: AllClientsComponent,
    canActivate: [AuthGuard],
    data: { roles: [RoleEnum.SVP_ADMIN, RoleEnum.SUPER_ADMIN] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class UsersModule {}
