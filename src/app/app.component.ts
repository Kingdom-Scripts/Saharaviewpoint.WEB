import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ResponsiveHelperComponent } from '@svp-components';
import { NxDropdownModule } from '@svp-directives';
import { ThemeService } from '@svp-services';
import topbar from 'topbar';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    ResponsiveHelperComponent,
    NxDropdownModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Saharaviewpoint Admin';
  environment = environment;

  constructor(public themeService: ThemeService) {
    this.setUpTopbarConfig();
  }

  setUpTopbarConfig(): void {
    topbar.config({
      autoRun      : true, 
      barThickness : 5,
      barColors    : {
        '0'        : 'rgba(26,  188, 156, .7)',
        '.3'       : 'rgba(214,  126, 42, .7)',
        '1.0'      : 'rgba(231, 76,  60,  .7)'
      },
      shadowBlur   : 5,
      shadowColor  : 'rgba(0, 0, 0, .5)',
      className    : 'topbar',
    });
  }
}
