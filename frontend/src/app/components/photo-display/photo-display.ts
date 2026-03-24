import { Component, EventEmitter, Input, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PhotoResponseModel, UserInfo } from '@models';
import { AuthService, PhotoService } from '@services';


function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

@Component({
  selector: 'app-photo-display',
  imports: [],
  templateUrl: './photo-display.html',
  styleUrl: './photo-display.scss',
})
export class PhotoDisplay {
  @Input()
  public photoData: PhotoResponseModel | undefined;

  @Input()
  public locationBreadcrumbs: string | undefined;

  @Output()
  public photoRemoved = new EventEmitter<string>();

  public menuOpen = false;
  public menuPanelTopPx = 0;
  public menuPanelRightPx = 0;

  public userLoggedIn: boolean = false;
  public userInfo: UserInfo | undefined;

  constructor(
    private photoService: PhotoService,
    private authService: AuthService
  ) {
    this.authService.isLoggedIn
      .pipe(takeUntilDestroyed())
      .subscribe((loggedIn) => {
        this.userLoggedIn = loggedIn;

        if(this.userLoggedIn){
          this.authService.getUserInfo().subscribe((resp: UserInfo) => {
            this.userInfo = resp;
          })
        }
      });
  }

  public toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    if (this.menuOpen) {
      this.closeMenu();
      return;
    }
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    this.menuPanelTopPx = rect.bottom + 4;
    this.menuPanelRightPx = window.innerWidth - rect.right;
    this.menuOpen = true;
  }

  public closeMenu(): void {
    this.menuOpen = false;
  }

  /** Placeholder — implement edit flow later */
  public onEditPhoto(): void {
    this.closeMenu();
  }

  public onBlockAuthor(): void {
    this.authService.blockUser(this.photoData?.author ?? "").subscribe((res: boolean) => {
      // TODO display toast
    });
    this.closeMenu();
  }

  public onRemovePhoto(): void {
    const id = this.photoData?.id ?? "";
    if (!id) {
      this.closeMenu();
      return;
    }
    this.photoService.deletePhoto(id).subscribe((res: boolean) => {
      if (res) {
        this.photoRemoved.emit(id);
      }
      // TODO display toast
    });
    this.closeMenu();
  }

  public buildDate(yearTaken: number, monthTaken: number | undefined, dayTaken: number | undefined): string {
    const year = Number(yearTaken);
    const month = isEmpty(monthTaken) ? "" : Number(monthTaken);
    if(month){
      const day = isEmpty(dayTaken) ? "" : Number(dayTaken);
      return day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : `${year}-${String(month).padStart(2, '0')}`;
    }else{
      return `${year}`;
    }
  }

  public getPhotoUrl(photoId: string): string{
    return this.photoService.getPhotoUrl(photoId)
  }

}
