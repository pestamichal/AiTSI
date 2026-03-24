import { Component } from '@angular/core';
import { AuthService } from '@services';
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
  constructor(private authService: AuthService){

  }


}
