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
        'bg-info': status === ProjectStatusEnum.REQUESTED,
        'bg-warning': status === ProjectStatusEnum.IN_PROGRESS,
        'bg-success': status === ProjectStatusEnum.COMPLETED
      }"
      >{{ status }}</span
    >
  `,
})
export class SvpStatusCardComponent {
  @Input({ required: true }) status: string = '';

  ProjectStatusEnum = ProjectStatusEnum;
}
