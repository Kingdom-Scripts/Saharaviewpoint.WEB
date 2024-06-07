import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'auth-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularSvgIconModule, FormsModule],
  template: `
    <div class="relative mt-3" [formGroup]="svpForm">
      <input type="{{svpType}}" id={{svpId}} formControlName="{{svpId}}" class="peer block dark:text-white" placeholder=" " autocomplete="{{svpAutoComplete}}" (change)="valueChanged.emit(svpForm.get(svpId)?.value)" (keyup)="keyUp.emit(svpForm.get(svpId)?.value)" />
      <label
        for="{{svpId}}"
        class="absolute top-2 left-1 z-10 origin-[0] -translate-y-4 scale-95 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-95 peer-focus:px-2 peer-focus:text-primary-500 dark:bg-night-700 dark:text-night-200">
        {{svpLabel}}
      </label>

      @if (originalType === 'password') {
        <span class="absolute top-2.5 right-5 cursor-pointer text-gray-400 dark:text-night-300" (click)="toggleShowPassword()">
          @if (!showPassword) {
          <svg-icon src="assets/icons/heroicons/outline/eye-off.svg" [svgClass]="'h-5 w-5'"> </svg-icon>
          } @else {
            <svg-icon src="assets/icons/heroicons/outline/eye.svg" [svgClass]="'h-5 w-5'"> </svg-icon>
          }
        </span>
      }
    </div>
  `
})
export class SvpAuthInputComponent implements OnInit {
  originalType!: 'text' | 'number' | 'password' | 'email';
  @Input({required: true}) svpType!: 'text' | 'number' | 'password' | 'email';
  @Input({required: true}) svpId: string = '';
  @Input({required: true}) svpLabel: string = '';
  @Input() svpAutoComplete: 'on' | 'off' = 'on';
  @Input({required: true}) svpForm!: FormGroup;

  @Output() valueChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() keyUp: EventEmitter<string> = new EventEmitter<string>();

  ngOnInit(): void {
    this.originalType = this.svpType;
  }

  showPassword: boolean = false;
  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
    this.svpType = this.showPassword ? 'text' : 'password';
  }

}