/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injectable, Injector, Type, inject } from '@angular/core';
import { ModalComponent } from './modal.component';
import { ModalRef } from './modal-ref';

@Injectable({ providedIn: 'root' })
export class ModalService {
  componentFactoryResolver = inject(ComponentFactoryResolver);
  appRef = inject(ApplicationRef);
  injector = inject(Injector);

  open<T>(component: Type<T>, param?: ModalModel): ModalRef {
    // Create the ModalComponent dynamically
    const modalFactory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
    const modalInstance = modalFactory.create(this.injector);

    // Attach the side panel to the application view
    this.appRef.attachView(modalInstance.hostView);
    const domElem = (modalInstance.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Add class to body to disable scrolling
    document.body.classList.add('overflow-hidden');

    // Set title and load the child component
    // modalRef.instance.title = param.title;
    modalInstance.instance.size = param?.size || 'normal';
    modalInstance.instance.loadComponent(component, param?.inputs, param?.outputs);

    // Close function to detach the view and remove the component
    modalInstance.instance.close = () => {
      this.appRef.detachView(modalInstance.hostView);
      modalInstance.destroy();

      // Remove class from body to enable scrolling
      document.body.classList.remove('overflow-hidden');
    };

    const modalRef = new ModalRef(modalInstance); // Create a ModalRef instance

    return modalRef;
  }
}

export interface ModalModel {
  size?: 'small' | 'normal' | 'large';
  inputs?: { [key: string]: any };
  outputs?: any;
}
