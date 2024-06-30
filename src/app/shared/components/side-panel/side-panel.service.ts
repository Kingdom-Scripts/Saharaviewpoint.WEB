/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, Injector, Type, inject } from '@angular/core';
import { SidePanelComponent } from './side-panel.component';
import { SidePanelRef } from './side-panel-ref';

@Injectable({ providedIn: 'root' })
export class SidePanelService {
  private componentFactoryResolver = inject(ComponentFactoryResolver);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);

  private sidePanelInstance!: ComponentRef<SidePanelComponent>;

  open<T>(component: Type<T>, param: SidePanelModel): SidePanelRef {
    // Create the SidePanelComponent dynamically
    const sidePanelFactory = this.componentFactoryResolver.resolveComponentFactory(SidePanelComponent);
    this.sidePanelInstance = sidePanelFactory.create(this.injector);

    // Attach the side panel to the application view
    this.appRef.attachView(this.sidePanelInstance.hostView);
    const domElem = (this.sidePanelInstance.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Add class to body to disable scrolling
    document.body.classList.add('overflow-hidden');

    // Sanitize param
    if (param.backdropClose === undefined) param.backdropClose = true;
    if (param.escClose === undefined) param.escClose = true;

    // Set title and load the child component
    this.sidePanelInstance.instance.size = param.size || 'normal';
    this.sidePanelInstance.instance.loadComponent(component, param.inputs, param.outputs);

    const sidePanelRef = new SidePanelRef(this.sidePanelInstance.instance); // Create a SidePanelRef instance

    // Close function from component
    this.sidePanelInstance.instance.close = (trigger: 'backdrop' | 'esc' | 'manual') => {
      if (!param.backdropClose && trigger === 'backdrop') {
        return;
      }

      if (!param.escClose && trigger === 'esc') {
        return;
      }

      this.close();
    };

    // Close function from ref
    sidePanelRef.onClose$.subscribe(() => {
      this.close();
    });

    return sidePanelRef;
  }

  // Close function to detach the view and remove the component
  close(): void {
    this.appRef.detachView(this.sidePanelInstance.hostView);
    this.sidePanelInstance.destroy();

    // Remove class from body to enable scrolling
    document.body.classList.remove('overflow-hidden');
  }
}

export class SidePanelModel {
  size?: 'small' | 'normal' | 'large';
  inputs?: { [key: string]: any };
  outputs?: any;
  backdropClose?: boolean;
  escClose?: boolean;
}
