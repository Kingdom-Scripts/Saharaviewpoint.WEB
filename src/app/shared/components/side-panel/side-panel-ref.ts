import { Subject } from 'rxjs';
import { SidePanelComponent } from './side-panel.component';

export class SidePanelRef {
  private onClose = new Subject<void>();

  constructor(public componentRef: SidePanelComponent) {}

  close(): void {
    this.onClose.next();
    this.componentRef.close('manual');
    this.onClose.complete();
  }

  get onClose$() {
    return this.onClose.asObservable();
  }
}