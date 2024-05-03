import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { SessionStorageUtility } from "@svp-utilities";

@Component({
  selector: 'app-planning',
  template: '<router-outlet></router-outlet>',
  standalone: true,
  imports: [RouterOutlet]
})
export class PlanningComponent {
  sessionStorage = inject(SessionStorageUtility);
  route = inject(ActivatedRoute);
}