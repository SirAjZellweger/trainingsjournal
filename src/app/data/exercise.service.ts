import { Injectable, inject } from "@angular/core";
import { UserDataService } from "./user-data.service";
import { BehaviorSubject, Observable, ReplaySubject, map, share, switchMap, tap } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { AngularFirestore, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { Workout } from "./interfaces/workout";
import { Exercise } from "./interfaces/exercise";
import { WorkoutService } from "./workout.service";
import { ActivatedRoute } from "@angular/router";

@Injectable()
export class ExerciseService {
  private readonly workoutService = inject(WorkoutService)

  private readonly exercisesSubject = new BehaviorSubject<QueryDocumentSnapshot<Exercise>[]>([]);

  public fetchExercises(): Observable<QueryDocumentSnapshot<Exercise>[]> {
    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection<Exercise>('exercises').get()),
      map(exercises => exercises.docs),
      tap(exercises => this.exercisesSubject.next(exercises)),
      switchMap(() => this.getExercises())
    );
  }

  public getExercises(): Observable<QueryDocumentSnapshot<Exercise>[]> {
    return this.exercisesSubject.asObservable();
  }

  public createExercise(name: string, order: number): Observable<string> {
    const exercise: Exercise = {
      name: name,
      order: order,
      sets: [
        {order: 1, weight: null, reps: null},
      ]
    };

    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection('exercises').add(exercise)),
      map(exercise => exercise.id)
    );
  }

  public editExercise(exercise: Exercise): Observable<void> {
    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection('exercises').doc(exercise.key).set(exercise)),
    );
  }

  public deleteExercise(key: string): Observable<void> {
    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection('exercises').doc(key).ref.delete()),
    );
  }
}