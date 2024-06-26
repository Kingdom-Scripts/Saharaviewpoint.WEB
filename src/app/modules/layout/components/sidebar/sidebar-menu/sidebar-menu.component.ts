import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MenuService } from '@svp-services';
import { SidebarSubmenuComponent } from '../sidebar-submenu/sidebar-submenu.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgClass, NgTemplateOutlet } from '@angular/common';
import { SubMenuItem } from '@svp-models';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgFor, NgClass, AngularSvgIconModule, NgTemplateOutlet, RouterLink, RouterLinkActive, SidebarSubmenuComponent],
})
export class SidebarMenuComponent {
  menuService = inject(MenuService);

  public toggleMenu(subMenu: SubMenuItem) {
    this.menuService.toggleMenu(subMenu);
  }
}
