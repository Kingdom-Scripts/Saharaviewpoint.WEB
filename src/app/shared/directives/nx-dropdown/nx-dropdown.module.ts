import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XDropdownDirective } from './x-dropdown.directive';

@NgModule({
  declarations: [XDropdownDirective],
  imports: [CommonModule],
  exports: [XDropdownDirective],
})
export class NxDropdownModule {}
