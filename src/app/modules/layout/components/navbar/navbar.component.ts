import { Component } from '@angular/core';
import { MenuService } from '@svp-services';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobilecomponent';
import { ProfileMenuComponent } from './profile-menu/profile-menu.component';
import { NavbarMenuComponent } from './navbar-menu/navbar-menu.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SvpTypographyModule } from '@svp-components';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    standalone: true,
    imports: [
        AngularSvgIconModule,
        NavbarMenuComponent,
        ProfileMenuComponent,
        NavbarMobileComponent,
        SvpTypographyModule
    ],
})
export class NavbarComponent {

  constructor(public menuService: MenuService) {}  
    
  public toggleMobileMenu(): void {
    this.menuService.showMobileMenu = true;
  }
}
