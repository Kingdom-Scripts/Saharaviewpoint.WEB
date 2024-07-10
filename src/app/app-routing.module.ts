import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { LayoutComponent } from './modules/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: '',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        loadChildren: () => import('./modules/project/project.module').then((m) => m.ProjectModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        loadChildren: () => import('./modules/planning/planning.module').then((m) => m.PlanningModule),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        loadChildren: () => import('./modules/approvals/approvals.module').then((m) => m.ApprovalsModule),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  { path: '**', redirectTo: 'error/404' },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule]
})
export class AppRoutingModule {}