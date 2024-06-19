/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injectable, Injector, Type, inject } from '@angular/core';
import { ModalComponent } from './modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private componentFactoryResolver = inject(ComponentFactoryResolver);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);

  open<T>(component: Type<T>, options?: ModalConfig): void {
    // Create the ModalComponent dynamically
    const modalFactory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
    const modalRef = modalFactory.create(this.injector);

    // Attach the side panel to the application view
    this.appRef.attachView(modalRef.hostView);
    const domElem = (modalRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Add class to body to disable scrolling
    document.body.classList.add('overflow-hidden');

    // Set title and load the child component
    if (options) {
      modalRef.instance.size = options.size || 'normal';
      modalRef.instance.loadComponent(component, options.inputs, options.outputs);
    }

    // Close function to detach the view and remove the component
    modalRef.instance.close = () => {
      this.appRef.detachView(modalRef.hostView);
      modalRef.destroy();

      // Remove class from body to enable scrolling
      document.body.classList.remove('overflow-hidden');
    };
  }
}

export interface ModalConfig {
  title?: string;
  size?: 'small' | 'normal' | 'large';
  inputs?: any;
  outputs?: any;
}
