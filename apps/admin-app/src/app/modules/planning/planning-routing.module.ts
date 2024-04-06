import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlanningComponent } from "./planning.component";
import { TasksComponent } from "./pages/tasks/tasks.component";

const routes: Routes = [
  {
    path: '',
    component: PlanningComponent,
    children: [
      {path: '', redirectTo: 'all', pathMatch: 'full'},
      {path: 'all', component: TasksComponent},     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningRoutingModule { }