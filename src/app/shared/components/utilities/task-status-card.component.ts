import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import {ProjectStatusEnum, TaskStatusEnum} from '@svp-models';

@Component({
  selector: "svp-task-status-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center text-sm space-x-2 px-3 py-1 rounded-md bg-gray-300 dark:bg-night-500">
      <div class="rounded-full p-2"
        [ngClass]="{
          'bg-[#800080]': status === statusEnum.TODO,
          'bg-[#FFA500]': status === statusEnum.IN_PROGRESS,
          'bg-[#008000]': status === statusEnum.COMPLETED
          }"
      ></div>

      <span class="text-gray-800 dark:text-night-50">
        {{ status }}
      </span>
    </div>
  `,
})
export class SvpTaskStatusCardComponent {
  @Input({required: true}) status: string = '';

  statusEnum = new TaskStatusEnum();
}
