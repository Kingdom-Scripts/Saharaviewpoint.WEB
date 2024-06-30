/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, ComponentFactoryResolver, EventEmitter, HostListener, Injectable, Injector, Input, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { ComponentOutletInjectorModule } from 'ng-dynamic-component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SidePanelRef } from './side-panel-ref';

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'app-side-panel',
  standalone: true,
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  imports: [CommonModule, ComponentOutletInjectorModule, AngularSvgIconModule],
})
export class SidePanelComponent {
  @Input({ required: true }) size: 'small' | 'normal' | 'large' = 'normal';

  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  private injector = inject(Injector);
  private cfr = inject(ComponentFactoryResolver);
  private sidePanelRef!: SidePanelRef;
  private backdropClose = true;

  loadComponent(component: any, inputs?: any, outputs?: any) {
    // Clear the container before loading the component
    this.container.clear();
    const componentFactory = this.cfr.resolveComponentFactory(component);

    // Create a new injector that includes SidePanelRef
    this.sidePanelRef = new SidePanelRef(this);
    const injector = Injector.create({
      providers: [{ provide: SidePanelRef, useValue: this.sidePanelRef }],
      parent: this.injector,
    });

    const componentRef = this.container.createComponent(componentFactory, 0, injector);

    // Assign inputs and outputs to the component
    if (inputs) {
      Object.assign(componentRef.instance as any, inputs);
    }

    if (outputs) {
      Object.keys(outputs).forEach(output => {
        if ((componentRef.instance as any)[output] instanceof EventEmitter) {
          (componentRef.instance as any)[output].subscribe(outputs[output]);
        }
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  close(trigger: 'backdrop' | 'esc' | 'manual') {}

  // Listen for esc key press
  @HostListener('document:keydown.escape')
  onEscKey() {
    this.close('esc');
  }
}
