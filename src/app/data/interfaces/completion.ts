import { Exercise } from "./exercise";

export interface Completion {
  start: any;
  end?: any;
  exercises: Exercise[];
}