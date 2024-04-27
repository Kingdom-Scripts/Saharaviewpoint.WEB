import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PlanningComponent } from "./planning.component";
import { TasksComponent } from "./pages/tasks/tasks.component";
import { BoardComponent } from "./pages/board/board.component";

const routes: Routes = [
  {
    path: '',
    component: PlanningComponent,
    children: [
      {path: '', redirectTo: 'all', pathMatch: 'full'},
      {path: 'all', component: TasksComponent},
      {path: 'board', component: BoardComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanningRoutingModule { }