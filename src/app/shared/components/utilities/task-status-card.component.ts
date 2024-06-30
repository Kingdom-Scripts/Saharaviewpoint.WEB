import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TaskStatusEnum } from '@svp-models';

@Component({
  selector: 'svp-task-status-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="badge text-nowrap text-xs"
      [ngClass]="{
        'bg-[#800080]': status === statusEnum.TODO,
        'bg-warning': status === statusEnum.IN_PROGRESS,
        'bg-success': status === statusEnum.COMPLETED
      }"
      >{{ status }}</span
    >
  `,
})
export class SvpTaskStatusCardComponent {
  @Input({ required: true }) status: string = '';

  statusEnum = TaskStatusEnum;
}
