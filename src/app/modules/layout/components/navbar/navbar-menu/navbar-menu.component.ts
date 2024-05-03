import { Component } from '@angular/core';
import { MenuService } from '@svp-services';
import { NavbarSubmenuComponent } from '../navbar-submenu/navbar-submenu.component';
import { NgFor, NgClass } from '@angular/common';
import { MenuItem } from '@svp-models';

@Component({
    selector: 'app-navbar-menu',
    templateUrl: './navbar-menu.component.html',
    styleUrls: ['./navbar-menu.component.scss'],
    standalone: true,
    imports: [
        NgFor,
        NgClass,
        NavbarSubmenuComponent,
    ],
})
export class NavbarMenuComponent {
  private showMenuClass = ['scale-100', 'animate-fade-in-up', 'opacity-100', 'pointer-events-auto'];
  private hideMenuClass = ['scale-95', 'animate-fade-out-down', 'opacity-0', 'pointer-events-none'];

  constructor(public menuService: MenuService) {}

  public toggleMenu(menu: MenuItem): void {
    menu.selected = !menu.selected;
  }

  public mouseEnter(event: Event): void {
    const target = event.target as HTMLElement;
    const element = target.querySelector('app-navbar-submenu')?.children[0];
    if (element) {
      this.hideMenuClass.forEach((c) => element.classList.remove(c));
      this.showMenuClass.forEach((c) => element.classList.add(c));
    }
  }

  public mouseLeave(event: Event): void {
    const target = event.target as HTMLElement;
    const element = target.querySelector('app-navbar-submenu')?.children[0];
    if (element) {
      this.showMenuClass.forEach((c) => element.classList.remove(c));
      this.hideMenuClass.forEach((c) => element.classList.add(c));
    }
  }
}
