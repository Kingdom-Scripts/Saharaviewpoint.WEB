import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { SideViewComponent, SvpButtonModule, SvpTaskStatusCardComponent, SvpTypographyModule, SvpUtilityModule } from "@svp-components";
import { TaskTypeEnum } from "@svp-models";
import { AngularSvgIconModule } from "angular-svg-icon";
import { DragDropModule } from "@angular/cdk/drag-drop";

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
    SideViewComponent, DragDropModule
  ],
})
export class BoardComponent {

  allTypes = TaskTypeEnum.asArray;
  
  tasks = [
    {
      id: 1,
      title: "Epic 1",
      status: "To Do",
      dueDate: "31 Dec 2021",
      type: TaskTypeEnum.EPIC
    },
    {

    }
  ]
}