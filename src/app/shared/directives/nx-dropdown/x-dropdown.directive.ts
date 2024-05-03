import { ReturnStatement } from '@angular/compiler';
import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[x-dropdown]',
})
export class XDropdownDirective {
  @Input() container: 'body' | null = null;
  dropdown: any;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  @HostBinding('class.show') isOpen = false;

  @HostListener('focusout')
  focusout() {
    this.isOpen = false;
    setTimeout(() => {
      this.removeFromBody(this.dropdown);
    }, 300);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.positionDropdown(this.dropdown);
  }

  @HostListener('click')
  toggleOpen() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      if (this.container === 'body') {
        let dropdown = this.el.nativeElement.querySelector('.nx-dropdown-content');
        this.appendToBody(dropdown);
      }
    } else {
      this.removeFromBody(this.dropdown);
    }
  }

  positionDropdown(dropdown: any) {
    if (!dropdown) return;

    let rect = this.el.nativeElement.getBoundingClientRect();

    this.renderer.setStyle(dropdown, 'display', 'inline-block');
    let dropdownRect = dropdown.getBoundingClientRect();
    this.renderer.setStyle(dropdown, 'display', '');

    let left,
      top,
      right,
      bottom = 0;

    if (rect.left + dropdownRect.width + rect.width > window.innerWidth) {
      left = rect.left - dropdownRect.width + rect.width;
    } else {
      left = rect.left;
    }

    if (rect.top + rect.height + dropdownRect.height > window.innerHeight) {
      top = rect.top - dropdownRect.height;
    } else {
      top = rect.top + rect.height;
    }

    this.renderer.setStyle(dropdown, 'left', left + 'px');
    this.renderer.setStyle(dropdown, 'top', top + 'px');
  }

  appendToBody(dropdown: any) {
    if (dropdown) {
      this.dropdown = dropdown;
      
      this.renderer.removeChild(this.el.nativeElement, dropdown);
      this.renderer.appendChild(document.body, dropdown);

      this.positionDropdown(this.dropdown);

      this.renderer.addClass(dropdown, 'show-body');
    }
  }

  removeFromBody(dropdown: any) {
    this.renderer.removeClass(dropdown, 'show-body');
    this.renderer.removeChild(document.body, dropdown);
    this.renderer.appendChild(this.el.nativeElement, dropdown);
  }
}
