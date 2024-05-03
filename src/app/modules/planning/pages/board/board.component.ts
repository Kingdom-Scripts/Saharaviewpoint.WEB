import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { SideViewComponent, SvpButtonModule, SvpTaskStatusCardComponent, SvpTypographyModule, SvpUtilityModule } from "@svp-components";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: "app-board",
  standalone: true,
  templateUrl: "./board.component.html",
  imports: [
    CommonModule,
    AngularSvgIconModule,
    SvpTaskStatusCardComponent,
    SvpUtilityModule,
    SvpTypographyModule,
    SvpButtonModule,
    SideViewComponent
  ],
})
export class BoardComponent {
  
}