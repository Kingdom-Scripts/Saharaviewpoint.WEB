import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AllProjectManagersComponent } from "./pages/all-project-managers/all-project-managers.components";
import { AllClientsComponent } from "./pages/all-clients/all-clients.components";

const routes: Routes = [
  { path: 'users/project-managers', component: AllProjectManagersComponent },
  { path: 'users/clients', component: AllClientsComponent }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class UsersModule {}