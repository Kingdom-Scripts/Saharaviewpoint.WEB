import { Component, OnInit, inject } from '@angular/core';
import { MenuService, StorageService } from '@svp-services';
import { RouterLink } from '@angular/router';
import { SidebarMenuComponent } from './sidebar-menu/sidebar-menu.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgClass } from '@angular/common';
import { ThemeService } from '@svp-services';
import { AuthService } from '@svp-api-services';
import { AuthRoleData, MenuItem } from '@svp-models';

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
  menuService = inject(MenuService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  storageService = inject(StorageService);

  userRoles!: AuthRoleData;
  
  ngOnInit(): void {
    this.userRoles = this.storageService.getUserRoles() as AuthRoleData;
    this.setMenuItems();
  }

  public toggleSidebar() {
    this.menuService.toggleSidebar();
  }

  toggleTheme() {
    this.themeService.theme = !this.themeService.isDark ? 'dark' : 'light';
  }

  async logout() {
    await this.authService.logUserOut();
    this.authService.maskUserAsLoggedOut();
  }

  setMenuItems() {
    const menus: MenuItem[] = [
      {
        isAccessible: true,
        group: 'Admin Base',
        separator: false,
        items: [
          {
            isAccessible: true,
            icon: 'assets/icons/dashboard.svg',
            label: 'Dashboard',
            route: '/dashboard',
          },
          {
            isAccessible: true,
            icon: 'assets/icons/project.svg',
            label: 'Projects',
            route: '/project',
          },
          {
            isAccessible: true,
            icon: 'assets/icons/tasks-app.svg',
            label: 'Tasks',
            route: '/tasks',
            children: [
              {
                isAccessible: false,
                label: 'All Tasks',
                route: '/tasks/all',
              },
              {
                isAccessible: true,
                label: 'Board',
                route: '/tasks/board',
              },
            ],
          },
        ],
      },
      {
        isAccessible: this.userRoles.SvpAdmin,
        group: 'Approval Management',
        separator: false,
        items: [
          {
            isAccessible: this.userRoles.SvpAdmin,
            icon: 'assets/icons/approve-invoice.svg',
            label: 'Task Setup Approvals',
            route: '/approvals/project-task-setup',
          },
        ],
      },
      {
        isAccessible: this.userRoles.SvpAdmin,
        group: 'Management',
        separator: false,
        items: [
          {
            isAccessible: this.userRoles.SvpAdmin,
            icon: 'assets/icons/users.svg',
            label: 'User Management',
            route: '/users',
            children: [
              {
                isAccessible: this.userRoles.SvpAdmin,
                label: 'Project Managers',
                route: '/users/project-managers',
              },
              {
                isAccessible: this.userRoles.SvpAdmin,
                label: 'Clients',
                route: '/users/clients',
              },
            ],
          },
        ],
      },
    ];

    this.menuService.setUpService(menus);
  }
}
