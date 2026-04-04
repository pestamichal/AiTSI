import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserInfo } from '@models';
import { AuthService } from '@services';

@Component({
  selector: 'app-user-panel',
  imports: [],
  templateUrl: './user-panel.html',
  styleUrl: './user-panel.scss',
})
export class UserPanel {
  public userBlocked = false;

  constructor(private authService: AuthService) {
    this.authService.isLoggedIn
      .pipe(takeUntilDestroyed())
      .subscribe((loggedIn) => {
        if (loggedIn) {
          this.authService.getUserInfo().subscribe((info: UserInfo) => {
            this.userBlocked = info.isBlocked;
          });
        } else {
          this.userBlocked = false;
        }
      });
  }

  public selectMyPhotos(){
    //TODO
  }
}
