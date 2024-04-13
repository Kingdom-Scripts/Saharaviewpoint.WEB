import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AuthGuard } from '../../shared/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full', },
  {
    path: 'dashboard',
    component: LayoutComponent,
    loadChildren: () => import('../dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'project',
    component: LayoutComponent,
    loadChildren: () => import('../project/project.module').then((m) => m.ProjectModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    component: LayoutComponent,
    loadChildren: () => import('../users/users.module').then((m) => m.UsersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    component: LayoutComponent,
    loadChildren: () => import('../planning/planning.module').then((m) => m.PlanningModule),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'error/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
