import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-unauthorized",
  standalone: true,
  templateUrl: "./unauthorized.component.html",
  imports: [RouterLink]
})
export class UnauthorizedComponent {}