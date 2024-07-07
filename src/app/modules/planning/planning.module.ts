import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './pages/board/board.component';
import { TasksComponent } from './pages/tasks/tasks.component';

const routes: Routes = [
  { path: 'tasks/all', component: TasksComponent },
  { path: 'tasks/board', component: BoardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class PlanningModule {}
