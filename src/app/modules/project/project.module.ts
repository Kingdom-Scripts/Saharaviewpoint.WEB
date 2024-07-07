import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllProjectsComponent } from './pages/all-projects/all-projects.component';

const routes: Routes = [{ path: 'project', component: AllProjectsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ProjectModule {}
