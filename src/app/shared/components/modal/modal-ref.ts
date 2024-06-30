import { ComponentRef } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalComponent } from './modal.component';

export class ModalRef {
  private onClose = new Subject<void>();

  constructor(public componentRef: ComponentRef<ModalComponent>) {}

  close(): void {
    this.onClose.next();
    this.componentRef.instance.close();
    this.onClose.complete();
  }

  private get onClose$() {
    return this.onClose.asObservable();
  }
}