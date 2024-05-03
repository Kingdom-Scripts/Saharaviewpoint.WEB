import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AllProjectManagersComponent } from "./pages/all-project-managers/all-project-managers.components";
import { UsersComponent } from "./users.component";

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
    children: [
      { path: '', redirectTo: 'project-managers', pathMatch: 'full' },
      { path: 'project-managers', component: AllProjectManagersComponent },
      { path: '**', redirectTo: 'error/404' },
    ],
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule { }