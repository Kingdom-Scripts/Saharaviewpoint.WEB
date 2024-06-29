import { Directive, ElementRef, Renderer2, OnInit, inject } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[x-dropdown-content]',
})
export class XDropdownContentDirective implements OnInit {
  el = inject(ElementRef);
  private renderer = inject(Renderer2);

  // Static property to track if styles have been added
  static stylesAdded = false;

  styles = `
    .nx-dropdown-content {
    display: none;
    position: absolute;
    z-index: 999999999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease-in-out, transform 0.3s ease;
    &.show {
      display: block;
      margin-top: 0;
    }

    &.show-body {
      top: 0;
      left: 0;
      display: block;
      margin-top: 0;
      opacity: 1;
      visibility: visible;
      // Reset transform for visible state
      transform: translateY(0); 
    }

    &.slide-from-left {
      transform: translateX(-2px);
      &.show-body {
        transform: translateX(0);
      }
    }

    &.slide-from-right {
      transform: translateX(-2px);
      &.show-body {
        transform: translateX(0);
      }
    }

    &.slide-from-top {
      transform: translateY(-2px); 
      &.show-body {
        transform: translateY(0); 
      }
    }
    
    &.slide-from-bottom {
      transform: translateY(-2px); 
      &.show-body {
        transform: translateY(0); 
      }
    }
  }

  .nx-dropdown-content ul {
  border: 1px solid #d1cdcd;
  }

  .dropdown-item {
  display: block;
  width: 100%;
  padding: 0.25rem 1.5rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  &.custom {
    padding: 0.25rem 1.5rem 0.25rem 0.5rem;
  }
}

.dropdown-item:hover,
.dropdown-item:focus {
  color: #101221;
  text-decoration: none;
  background-color: #ebedf3;
  cursor: pointer;
}
    `;

  ngOnInit(): void {
    // Only add styles if they haven't been added before
    if (!XDropdownContentDirective.stylesAdded) {
      // Create a <style> element
      const styleEl = this.renderer.createElement('style');
      // Set the text content of the <style> element to your CSS rules
      this.renderer.setProperty(styleEl, 'textContent', this.styles);
      // Append the <style> element to the document's <head>
      this.renderer.appendChild(document.head, styleEl);

      // Mark styles as added
      XDropdownContentDirective.stylesAdded = true;
    }

    // Optionally, add 'my-custom-class' to the directive's element
    this.renderer.addClass(this.el.nativeElement, 'my-custom-class');
  }
}
