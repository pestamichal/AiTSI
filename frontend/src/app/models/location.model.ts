export interface RegionNode {
  name: string;
  id: number;
  parent: number | null;
  subregions: RegionNode[] | null;
}

export interface TerritorialData {
  data: RegionNode[];
}
