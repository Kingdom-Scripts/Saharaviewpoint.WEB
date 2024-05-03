import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ProjectStatusEnum } from "@svp-models";

@Component({
  selector: "svp-status-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-2 px-4 py-2 rounded-md bg-gray-300 dark:bg-night-500">
      <div class="rounded-full p-2"
        [ngClass]="{
          'bg-[#800080]': status === ProjectStatusEnum.REQUESTED,
          'bg-[#FFA500]': status === ProjectStatusEnum.IN_PROGRESS,
          'bg-[#008000]': status === ProjectStatusEnum.COMPLETED
          }"
      ></div>
      
      <span class="text-gray-800 dark:text-night-50">
        {{ status }}
      </span>
    </div>
  `,
})
export class SvpStatusCardComponent {
  @Input({required: true}) status: string = '';

  ProjectStatusEnum = new ProjectStatusEnum();
}