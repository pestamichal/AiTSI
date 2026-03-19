export type TerritorialData = Record<string, Voivodeship>
export type Voivodeship = Record<string, Powiat>
export type Powiat = Record<string, string[]>