import { Component, HostListener } from '@angular/core';
import { Header, FilterTab, SearchBar, UserPanel, PhotoList} from '@components';

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
  protected filterDrawerOpen = false;
  protected userDrawerOpen = false;

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
