export interface Exercise {
  name: string;
  order: number;
  sets: Set[];
}

interface Set {
  order: number;
  weight: number;
  reps: number;
}