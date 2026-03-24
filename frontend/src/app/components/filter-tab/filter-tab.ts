import { Component, OnInit } from '@angular/core';
import { RegionNode, TerritorialData } from '@models';
import { LocationService } from '@services';

@Component({
  selector: 'app-filter-tab',
  standalone: true,
  imports: [],
  templateUrl: './filter-tab.html',
  styleUrl: './filter-tab.scss',
})
export class FilterTab implements OnInit {
  public breadcrumb: RegionNode[] = [];
  public currentChildren: RegionNode[] = [];

  constructor(private locationService: LocationService) {}

  public ngOnInit(): void {
    this.locationService.getTerritorialData().subscribe((resp: TerritorialData) => {
      this.breadcrumb = [resp.data[0]];
      this.currentChildren = resp.data[0].subregions!;
    });
  }

  public get currentNode(): RegionNode | null {
    return this.breadcrumb.length > 0
      ? this.breadcrumb[this.breadcrumb.length - 1]
      : null;
  }

  public navigateForward(child: RegionNode): void {
    this.breadcrumb = [...this.breadcrumb, child];
    this.currentChildren = child.subregions ?? [];
  }

  public navigateBack(): void {
    if (this.breadcrumb.length <= 1) return;
    this.breadcrumb = this.breadcrumb.slice(0, -1);
    const parent = this.breadcrumb[this.breadcrumb.length - 1];
    this.currentChildren = parent.subregions ?? [];
  }
}
