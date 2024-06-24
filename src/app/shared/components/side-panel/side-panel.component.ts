/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, ComponentFactoryResolver, EventEmitter, Injectable, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentOutletInjectorModule } from 'ng-dynamic-component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'app-side-panel',
  standalone: true,
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  imports: [CommonModule, ComponentOutletInjectorModule, AngularSvgIconModule],
})
export class SidePanelComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) size: 'small' | 'normal' | 'large' = 'normal';

  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  constructor(private cfr: ComponentFactoryResolver) {}

  loadComponent(component: any, inputs?: any, outputs?: any) {
    // Clear the container before loading the component
    this.container.clear();
    const componentFactory = this.cfr.resolveComponentFactory(component);
    const componentRef = this.container.createComponent(componentFactory);

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

    // Pass the close function to the dynamically loaded component
    if ((componentRef.instance as any).close !== undefined) {
      (componentRef.instance as any).close = this.close.bind(this);
    } else {
      (componentRef.instance as any).close = () => {
        this.close();
      };
    }
  }

  close() {
    this.container.clear();
  }
}