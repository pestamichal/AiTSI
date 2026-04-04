import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Header, FilterTab, SearchBar, PhotoList, UserPanel } from '@components';
import { UserInfo } from '@models';
import { AuthService, PhotoFeedService } from '@services';

@Component({
  selector: 'app-my-photos',
  imports: [
    Header,
    FilterTab,
    SearchBar,
    PhotoList,
  ],
  templateUrl: './my-photos.html',
  styleUrl: './my-photos.scss',
})
export class MyPhotos implements OnInit, OnDestroy {
  protected filterDrawerOpen = false;
  protected photoListEmpty = false;

  constructor(
    private photoFeed: PhotoFeedService,
    private authService: AuthService
  ) {
    this.photoFeed.photos$
      .pipe(takeUntilDestroyed())
      .subscribe((photos) => {
        this.photoListEmpty = photos.length === 0;
      });
  }

  protected openFilterDrawer(): void {
    this.filterDrawerOpen = true;
  }

  protected closeFilterDrawer(): void {
    this.filterDrawerOpen = false;
  }

  @HostListener('document:keydown.escape')
  protected onEscapeCloseFilterDrawer(): void {
    if (this.filterDrawerOpen) {
      this.closeFilterDrawer();
    }
  }

  public ngOnInit(): void {
    const social = this.authService.googleUserAccount.getValue();
    if (social?.email) {
      this.photoFeed.setAuthorEmailFilter(social.email);
    }

    this.authService.getUserInfo().subscribe({
      next: (user: UserInfo) => {
        this.photoFeed.setAuthorEmailFilter(user.email);
        this.photoFeed.refreshPhotos();
      },
      error: () => {
        this.photoFeed.setAuthorEmailFilter(null);
        this.photoFeed.refreshPhotos();
      },
    });
  }

  public ngOnDestroy(): void {
    this.photoFeed.setAuthorEmailFilter(null);
  }
}
