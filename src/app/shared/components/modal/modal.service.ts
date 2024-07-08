/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector, Type, inject } from '@angular/core';
import { ModalComponent } from './modal.component';
import { ModalRef } from './modal-ref';
import { AnimationBuilder, style, animate } from '@angular/animations';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private componentFactoryResolver = inject(ComponentFactoryResolver);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);
  private animationBuilder = inject(AnimationBuilder);

  private modalInstance!: ComponentRef<ModalComponent>;

  open<T>(component: Type<T>, param?: ModalModel): ModalRef {
    // Create the ModalComponent dynamically
    const modalFactory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
    this.modalInstance = modalFactory.create(this.injector);

    // Attach the side panel to the application view
    this.appRef.attachView(this.modalInstance.hostView);
    const domElem = (this.modalInstance.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Add class to body to disable scrolling
    document.body.classList.add('overflow-hidden');

    // Set title and load the child component
    // modalRef.instance.title = param.title;
    this.modalInstance.instance.size = param?.size || 'normal';
    this.modalInstance.instance.loadComponent(component, param?.inputs, param?.outputs);

    // Close function to detach the view and remove the component
    this.modalInstance.instance.close = () => {
      // Animate the close
      this.animateClose();

      // Detach the view and remove the component
      setTimeout(() => {
        this.appRef.detachView(this.modalInstance.hostView);
        this.modalInstance.destroy();
      }, 150);

      // Remove class from body to enable scrolling
      document.body.classList.remove('overflow-hidden');
    };

    const modalRef = new ModalRef(this.modalInstance); // Create a ModalRef instance

    return modalRef;
  }

  animateClose(): void {
    const backdropFadeOut = this.animationBuilder.build([style({ opacity: 1 }), animate(300, style({ opacity: 0 }))]);
    const player = backdropFadeOut.create(this.modalInstance.instance.modal.element.nativeElement);
    const backdropPlayer = backdropFadeOut.create(this.modalInstance.instance.backdrop.element.nativeElement);

    // Play the animations
    player.play();
    backdropPlayer.play();
  }
}

export interface ModalModel {
  size?: 'small' | 'normal' | 'large';
  inputs?: { [key: string]: any };
  outputs?: any;
}
