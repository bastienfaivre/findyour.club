export interface ActivityTypeOption {
  slug: string
  name: string
}

export interface CountryOption {
  code: string
  label: string
}

export interface CantonOption {
  code: string
  name: string
}

export type LocationResult = {
  swisstopoId: string
  plz: string
  name: string
  cantonCode: string
}
