import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProjectStatusEnum } from '@svp-models';

@Component({
  selector: 'svp-status-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="badge text-nowrap"
      [ngClass]="{
        'bg-[#800080]': status === ProjectStatusEnum.REQUESTED,
        'bg-[#FFA500]': status === ProjectStatusEnum.IN_PROGRESS,
        'bg-[#008000]': status === ProjectStatusEnum.COMPLETED
      }"
      >{{ status }}</span
    >
  `,
})
export class SvpStatusCardComponent {
  @Input({ required: true }) status: string = '';

  ProjectStatusEnum = ProjectStatusEnum;
}
