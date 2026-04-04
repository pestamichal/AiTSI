import { Component, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Header, FilterTab, SearchBar, UserPanel, PhotoList} from '@components';
import { PhotoFeedService } from '@services';

@Component({
  selector: 'app-feed.component',
  imports: [
    Header,
    FilterTab,
    SearchBar,
    UserPanel,
    PhotoList
  ],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.scss',
})
export class FeedComponent {
  private readonly photoFeed = inject(PhotoFeedService);

  protected filterDrawerOpen = false;
  protected userDrawerOpen = false;
  protected photoListEmpty = false;

  constructor() {
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

  protected openUserDrawer(): void {
    this.userDrawerOpen = true;
  }

  protected closeUserDrawer(): void {
    this.userDrawerOpen = false;
  }

  @HostListener('document:keydown.escape')
  protected onEscapeCloseDrawers(): void {
    if (this.userDrawerOpen) {
      this.closeUserDrawer();
      return;
    }
    if (this.filterDrawerOpen) {
      this.closeFilterDrawer();
    }
  }
}
