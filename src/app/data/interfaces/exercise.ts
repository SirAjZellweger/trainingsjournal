export interface Exercise {
  key?: string;
  name: string;
  order: number;
  tempo?: string;
  rom?: string;
  sets: Set[];
}

export interface Set {
  order: number;
  weight: number | null;
  reps: number | null;
}