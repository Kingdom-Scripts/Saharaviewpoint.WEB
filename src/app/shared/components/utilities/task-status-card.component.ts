import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TaskStatusEnum } from '@svp-models';

@Component({
  selector: 'svp-task-status-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="flex items-center space-x-2 rounded-md bg-gray-300 px-3 py-1 text-sm dark:bg-night-500">
      <span
        class="rounded-full p-2"
        [ngClass]="{
          'bg-[#800080]': status === statusEnum.TODO,
          'bg-warning': status === statusEnum.IN_PROGRESS,
          'bg-success': status === statusEnum.COMPLETED
        }"></span>

      <span class="text-gray-800 dark:text-night-100">
        {{ status }}
      </span>
    </p>
  `,
})
export class SvpTaskStatusCardComponent {
  @Input({ required: true }) status: string = '';

  statusEnum = TaskStatusEnum;
}
