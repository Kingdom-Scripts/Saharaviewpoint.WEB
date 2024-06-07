import { CommonModule } from "@angular/common";
import { Component, Injectable, inject } from "@angular/core";
import { SideViewService } from "./side-view.service";
import { ComponentOutletInjectorModule } from 'ng-dynamic-component';

@Injectable({ providedIn: 'root' })
@Component({
  selector: 'svp-side-view',
  standalone: true,
  templateUrl: './side-view.component.html',
  styleUrls: ['./side-view.component.scss'],
  imports: [CommonModule, ComponentOutletInjectorModule],
})
export class SideViewComponent  {
  sideViewService = inject(SideViewService);
}