/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SideViewService {
  _isActive = false;
  private _component: any;
  private _inputs?: any;
  private _outputs?: any;

  triggerOutputs$: Subject<{ [key: string]: any}> = new Subject();
  showComponent(component: any, inputs?: any, outputs?: any) {
    this._component = component;
    this._inputs = inputs;
    this._outputs = {...outputs, exit: () => this.closeSideView()};
    this._isActive = true;
  }

  get component() {
    return this._component;
  }

  get isActive() {
    return this._isActive;
  }

  get inputs() {
    return this._inputs;
  }

  get outputs() {
    return this._outputs;
  }

  closeSideView() {
    this._isActive = false;
    this._component = null;
  }
}