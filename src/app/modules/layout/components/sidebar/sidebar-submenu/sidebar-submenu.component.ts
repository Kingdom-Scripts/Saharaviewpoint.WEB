import { Component, Input } from '@angular/core';
import { MenuService } from '@svp-services';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RouterLinkActive, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgTemplateOutlet } from '@angular/common';
import { SubMenuItem } from '@svp-models';

@Component({
    selector: 'app-sidebar-submenu',
    templateUrl: './sidebar-submenu.component.html',
    styleUrls: ['./sidebar-submenu.component.scss'],
    standalone: true,
    imports: [
        NgClass,
        NgFor,
        NgTemplateOutlet,
        RouterLinkActive,
        RouterLink,
        AngularSvgIconModule,
    ],
})
export class SidebarSubmenuComponent  {
  @Input() public submenu = <SubMenuItem>{};

  constructor(public menuService: MenuService) {}

  public toggleMenu(menu: SubMenuItem) {
    this.menuService.toggleSubMenu(menu);
  }

  private collapse(items: Array<SubMenuItem>) {
    items.forEach((item) => {
      item.expanded = false;
      if (item.children) this.collapse(item.children);
    });
  }
}
