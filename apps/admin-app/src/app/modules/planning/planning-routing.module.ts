import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlanningComponent } from "./planning.component";
import { TasksComponent } from "./pages/tasks/tasks.component";

const routes: Routes = [
  {
    path: '',
    component: PlanningComponent,
    children: [
      {path: '', redirectTo: 'tasks', pathMatch: 'full'},
      {path: 'tasks', component: TasksComponent},     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningRoutingModule { }