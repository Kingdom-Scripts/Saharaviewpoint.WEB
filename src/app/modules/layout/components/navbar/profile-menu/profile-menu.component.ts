import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { ClickOutsideDirective } from '@svp-directives';
import { UserModel } from '@svp-models';
import { StorageService } from '@svp-services';
import { AuthService } from '@svp-api-services';

@Component({
    selector: 'app-profile-menu',
    templateUrl: './profile-menu.component.html',
    styleUrls: ['./profile-menu.component.scss'],
    standalone: true,
    imports: [
        ClickOutsideDirective,
        NgClass,
        RouterLink,
    ],
})
export class ProfileMenuComponent implements OnInit {
  public isMenuOpen = false;
  user?: UserModel;

  constructor(
    private authService: AuthService,
    private storageService: StorageService) {
      this.ListenForAuthChange();
    }

  ngOnInit(): void {}

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ListenForAuthChange() {
    this.authService.OnAuthStatusChange().subscribe((state) => {
      if (state) {
        this.user = this.storageService.getUser();
      } else {
        this.user = undefined;
      }
    });
  }

  async logout() {
    await this.authService.logUserOut();
    this.authService.maskUserAsLoggedOut();
  }
}
