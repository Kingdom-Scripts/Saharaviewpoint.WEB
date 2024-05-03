/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-responsive-helper',
    templateUrl: './responsive-helper.component.html',
    styleUrls: ['./responsive-helper.component.scss'],
    standalone: true,
    imports: [NgIf],
})
export class ResponsiveHelperComponent {
  @Input({required: true}) env: any = null;
}