/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, ComponentFactoryResolver, EventEmitter, inject, Injectable, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentOutletInjectorModule } from 'ng-dynamic-component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ThemeService } from '@svp-services';

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [CommonModule, ComponentOutletInjectorModule, AngularSvgIconModule],
  animations: [
    trigger('fade', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [style({ opacity: 0 }), animate(150)]),
      transition('* => void', [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
})
export class ModalComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) size: 'small' | 'normal' | 'large' = 'normal';

  @ViewChild('modal', { read: ViewContainerRef, static: true }) modal!: ViewContainerRef;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  @ViewChild('backdrop', { read: ViewContainerRef, static: true }) backdrop!: ViewContainerRef;

  themeService = inject(ThemeService);
  
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
