/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, ContentChildren, Directive, ElementRef, HostBinding, HostListener, Input, QueryList, Renderer2, booleanAttribute } from '@angular/core';
import { XDropdownContentDirective } from './x-dropdown-content.directive';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[x-dropdown]',
})
export class XDropdownDirective implements AfterViewInit {
  @Input({ transform: booleanAttribute }) closeOnFocusOut = true;
  @Input() position: 'auto' | 'top' | 'bottom' | 'left' | 'right' = 'auto';
  @Input() trigger: 'click' | 'hover' = 'click';
  @ContentChildren(XDropdownContentDirective) contentDirectives!: QueryList<XDropdownContentDirective>;

  dropdown: any;
  contentElement: any;
  renderedPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  styles: { [key: string]: string } = {
    position: 'relative',
    display: 'inline-block',
  };

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.el.nativeElement, 'nx-dropdown');
    this.renderer.setAttribute(this.el.nativeElement, 'tabindex', '0');
    Object.keys(this.styles).forEach((key: string) => {
      this.renderer.setStyle(this.el.nativeElement, key, this.styles[key]);
    });

    // console.log('XDropdownDirective created: ', el) // TODO: remove this line
  }

  ngAfterViewInit(): void {
    console.log();
    this.contentDirectives.forEach((contentDirective: XDropdownContentDirective) => {
      this.contentElement = contentDirective.el.nativeElement;
      this.renderer.addClass(this.contentElement, 'nx-dropdown-content');
    });
  }

  @HostBinding('class.show') isOpen = false; // Binds the 'show' class to the host element based on the isOpen property

  @HostListener('click') // Listens for click events on the host element
  toggleOpen() {
    if (this.trigger === 'hover') return; // Return immediately if the trigger property is set to 'hover'

    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      // If the dropdown is now open
      this.appendDropdownToBody(); // Moves the dropdown content to the body of the document
    } else {
      // If the dropdown is now closed
      this.removeFromBody(this.dropdown); // Removes the dropdown from the body, if it was appended there
    }
  }

  @HostListener('focusout') // Listens for the focusout event on the host element
  focusout() {
    // Return immediately if the closeOnFocusOut property is set to false or the trigger property is set to 'hover'
    if (!this.closeOnFocusOut || this.trigger === 'hover') return;

    this.isOpen = false; // Sets isOpen to false, indicating the dropdown should be closed
    setTimeout(() => {
      this.removeFromBody(this.dropdown); // Removes the dropdown from the body, effectively hiding it
    }, 250);
  }

  @HostListener('mouseover') // Listens for the hover event on the host element
  openOnHover() {
    if (this.trigger === 'click') return; // Return immediately if the trigger property is set to 'click'

    this.isOpen = true; // Sets isOpen to true, indicating the dropdown should be open
    this.appendDropdownToBody(); // Moves the dropdown content to the body of the document
  }

  @HostListener('mouseleave') // Listens for the mouseleave event on the host element
  closeOnLeave() {
    if (this.trigger === 'click') return; // Return immediately if the trigger property is set to 'click'

    this.isOpen = false; // Sets isOpen to false, indicating the dropdown should be closed
    setTimeout(() => {
      this.removeFromBody(this.dropdown); // Removes the dropdown from the body, effectively hiding it
    }, 250);
  }

  @HostListener('window:resize', ['$event']) // Listens for the resize event on the window object
  onResize() {
    this.positionDropdown(this.dropdown); // Repositions the dropdown based on the new window size
  }

  positionDropdown(dropdown: any) {
    // Return immediately if the dropdown parameter is falsy
    if (!dropdown) return;

    // Get the bounding rectangle of the element this directive is attached to
    const elementRect = this.el.nativeElement.getBoundingClientRect();

    // Temporarily display the dropdown to calculate its dimensions
    this.renderer.setStyle(dropdown, 'display', 'inline-block');
    const dropdownRect = dropdown.getBoundingClientRect(); // Get the bounding rectangle of the dropdown
    this.renderer.setStyle(dropdown, 'display', ''); // Reset the display property

    let left: number,
      top: number = 0;

    if (this.position !== 'auto') {
      this.renderedPosition = this.position;
      switch (this.position) {
        case 'top':
          left = elementRect.left;
          top = elementRect.top - dropdownRect.height - 2;
          break;
        case 'bottom':
          left = elementRect.left;
          top = elementRect.top + elementRect.height + 2;
          break;
        case 'left':
          left = elementRect.left - dropdownRect.width - 2;
          top = elementRect.top;
          break;
        case 'right':
          left = elementRect.left + elementRect.width + 2;
          top = elementRect.top;
          break;
      }
    } else {
      // Calculate the left position of the dropdown
      if (elementRect.left + dropdownRect.width + elementRect.width > window.innerWidth) {
        // If displaying the dropdown to the right goes outside the window, adjust it to the left
        left = elementRect.left - dropdownRect.width + elementRect.width - 2;
        this.renderedPosition = 'left';
      } else {
        // Otherwise, position it to the right of the element
        left = elementRect.left + 2;
        this.renderedPosition = 'right';
      }

      // Calculate the top position of the dropdown
      if (elementRect.top + elementRect.height + dropdownRect.height > window.innerHeight) {
        // If displaying the dropdown below goes outside the window, adjust it above the element
        top = elementRect.top - dropdownRect.height - 2;
        this.renderedPosition = 'top';
      } else {
        // Otherwise, position it below the element
        top = elementRect.top + elementRect.height + 2;
        this.renderedPosition = 'bottom';
      }
    }

    // Apply the calculated left and top positions to the dropdown
    this.renderer.setStyle(dropdown, 'left', left + 'px');
    this.renderer.setStyle(dropdown, 'top', top + 'px');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appendDropdownToBody() {
    console.log('---> appendDropdownToBody')
    // Check if the dropdown parameter is truthy
    if (this.contentElement) {
      this.dropdown = this.contentElement; // Assign the dropdown parameter to the class property

      // Remove the dropdown from its current parent element
      this.renderer.removeChild(this.el.nativeElement, this.contentElement);
      // Append the dropdown to the body of the document
      this.renderer.appendChild(document.body, this.contentElement);

      // Position the dropdown appropriately on the screen
      this.positionDropdown(this.dropdown);

      // Add a CSS class to the dropdown to indicate it's appended to the body
      this.renderer.addClass(this.contentElement, 'show-body');
      switch (this.renderedPosition) {
        case 'top':
          this.renderer.addClass(this.contentElement, 'slide-from-bottom');
          break;
        case 'bottom':
          this.renderer.addClass(this.contentElement, 'slide-from-top');
          break;
        case 'left':
          this.renderer.addClass(this.contentElement, 'slide-from-right');
          break;
        case 'right':
          this.renderer.addClass(this.contentElement, 'slide-from-left');
          break;
      }
    }
  }

  removeFromBody(dropdown: any) {
    console.log('---> removeFromBody')
    // Remove the CSS class that indicates the dropdown is appended to the body
    this.renderer.removeClass(dropdown, 'show-body');
    // Remove the dropdown from the body of the document
    this.renderer.removeChild(document.body, dropdown);
    // Append the dropdown back to its original parent element
    this.renderer.appendChild(this.el.nativeElement, dropdown);
  }
}
