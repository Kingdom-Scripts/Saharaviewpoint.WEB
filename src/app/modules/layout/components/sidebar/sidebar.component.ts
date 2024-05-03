import { Component, OnInit } from '@angular/core';
import { MenuService } from '@svp-services';
import { RouterLink } from '@angular/router';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgClass } from '@angular/common';
import { ThemeService } from '@svp-services';
import { Menu } from 'src/app/core/constants/menu';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    standalone: true,
    imports: [
        NgClass,
        AngularSvgIconModule,
        SidebarMenuComponent,
        RouterLink,
    ],
})
export class SidebarComponent implements OnInit {
  constructor(public themeService: ThemeService, public menuService: MenuService) {
  }

  ngOnInit(): void {
    this.menuService.setUpService(Menu.pages);
  }

  public toggleSidebar() {
    this.menuService.toggleSidebar();
  }

  toggleTheme() {
    this.themeService.theme = !this.themeService.isDark ? 'dark' : 'light';
  }
}
