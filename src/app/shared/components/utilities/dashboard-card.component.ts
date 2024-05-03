import { Component, Input } from "@angular/core";
import { AngularSvgIconModule } from "angular-svg-icon";

@Component({
  selector: 'svp-dashboard-card',
  standalone: true,
  imports: [AngularSvgIconModule],
  template: `
    <div class="bg-white p-4 rounded-xl cursor-pointer group hover:bg-primary-400 dark:bg-night-700 dark:hover:bg-primary-400">
      <div class="m-2 space-y-4">
        <svg-icon src="{{icon}}" [svgClass]="'h-16 w-16 group-hover:text-gray-50 dark:text-night-100'"></svg-icon>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-night-50 group-hover:text-gray-50">{{title}}</h1>
        <p class="text-base text-gray-600 dark:text-night-100 group-hover:text-gray-50">{{description}}</p>
      </div>        
    </div>
  `
})
export class SvpDashboardCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() icon: string = '';
}