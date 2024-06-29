import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XDropdownDirective } from './x-dropdown.directive';
import { XDropdownContentDirective } from './x-dropdown-content.directive';

@NgModule({
  declarations: [XDropdownDirective, XDropdownContentDirective],
  imports: [CommonModule],
  exports: [XDropdownDirective, XDropdownContentDirective],
})
export class NxDropdownModule {}
