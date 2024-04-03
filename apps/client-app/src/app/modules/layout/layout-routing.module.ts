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
    // canActivate: [AuthGuard] TODO: uncomment this line
  },
  {
    path: 'project',
    component: LayoutComponent,
    loadChildren: () => import('../project/project.module').then((m) => m.ProjectModule),
    // canActivate: [AuthGuard] TODO: uncomment this line
  },
  { path: '**', redirectTo: 'error/404' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
