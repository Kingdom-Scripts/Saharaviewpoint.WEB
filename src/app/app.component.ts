import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ResponsiveHelperComponent } from './shared/components/responsive-helper/responsive-helper.component';
import { ThemeService } from './core/services/theme.service';
import topbar from 'topbar';
import { NxDropdownModule } from './shared/directives/nx-dropdown/nx-dropdown.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ResponsiveHelperComponent, NxDropdownModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Saharaviewpoint WEB';

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
