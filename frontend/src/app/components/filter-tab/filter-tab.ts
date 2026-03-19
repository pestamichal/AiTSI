import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Powiat, TerritorialData, Voivodeship } from '@models';

@Component({
  selector: 'app-filter-tab',
  standalone: true,
  imports: [],
  templateUrl: './filter-tab.html',
  styleUrl: './filter-tab.scss',
})
export class FilterTab implements OnInit {
  private data: TerritorialData | null = null;
  public path: Record<string, TerritorialData | Voivodeship | Powiat | string[]>[] = []
  public currentNode: string = ""
  

  constructor(
    private http: HttpClient
  ){

  }

  public ngOnInit(): void {
    this.http.get<TerritorialData>('assets/polska_administracja.json').subscribe(
      (data) => { 
        this.data = data;
        this.path = [this.data]
        this.currentNode = Object.keys(this.data)[0]
       }
    )
  }

  public navigateForward(nodeValue: string): void {
    const current = this.path[this.path.length - 1][this.currentNode]
 
    if(current && nodeValue in current && !Array.isArray(current))
    {
      this.path = [...this.path, current];
      this.currentNode = nodeValue;
    }
  }

  public navigateBack(): void{
    if(this.path.length === 1) return;

    this.path = this.path.slice(0, -1);
    this.currentNode = Object.keys(this.path[this.path.length - 1])[0]
  }

  public getChildrenAsList(): string[]{
    const current = this.path[this.path.length - 1][this.currentNode]
    if(!Array.isArray(current)){
      const children = Object.keys(current);
      return children
    }else{
      return current;
    }
  }
}
