/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injectable, Injector, Type, inject } from '@angular/core';
import { SidePanelComponent } from './side-panel.component';

@Injectable({ providedIn: 'root' })
export class SidePanelService {
  private componentFactoryResolver = inject(ComponentFactoryResolver);
  private appRef = inject(ApplicationRef);
  private injector = inject(Injector);

  open<T>(component: Type<T>, param: SidePanelModel): void {
    // Create the SidePanelComponent dynamically
    const sidePanelFactory = this.componentFactoryResolver.resolveComponentFactory(SidePanelComponent);
    const sidePanelRef = sidePanelFactory.create(this.injector);

    // Attach the side panel to the application view
    this.appRef.attachView(sidePanelRef.hostView);
    const domElem = (sidePanelRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Add class to body to disable scrolling
    document.body.classList.add('overflow-hidden');

    // Set title and load the child component
    sidePanelRef.instance.title = param.title;
    sidePanelRef.instance.size = param.size || 'normal';
    sidePanelRef.instance.loadComponent(component, param.inputs, param.outputs);

    // Close function to detach the view and remove the component
    sidePanelRef.instance.close = () => {
      this.appRef.detachView(sidePanelRef.hostView);
      sidePanelRef.destroy();

      // Remove class from body to enable scrolling
      document.body.classList.remove('overflow-hidden');
    };
  }
}

export interface SidePanelModel {
  title: string;
  size?: 'small' | 'normal' | 'large';
  inputs?: any;
  outputs?: any;
}
