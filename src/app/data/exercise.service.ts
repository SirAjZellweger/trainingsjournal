import { Injectable, inject } from "@angular/core";
import { UserDataService } from "./user-data.service";
import { BehaviorSubject, Observable, map, switchMap, tap } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { AngularFirestore, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { Workout } from "./interfaces/workout";
import { Exercise } from "./interfaces/exercise";
import { WorkoutService } from "./workout.service";

@Injectable({
  providedIn: 'root',
})
export class ExerciseService {
  private readonly db = inject(AngularFirestore);
  private readonly authService = inject(AuthService);
  private readonly workoutService = inject(WorkoutService)

  private readonly exercisesSubject = new BehaviorSubject<QueryDocumentSnapshot<Exercise>[]>([]);

  public getWorkout(key: string): Observable<any> {
    return this.authService.user$.pipe(
      switchMap(user => this.db.collection('users').doc(user?.uid).collection('workouts').doc(key).ref.get()),
      map(workout => workout.data())
    );
  }

  public fetchExercises(workoutKey: string): Observable<QueryDocumentSnapshot<Exercise>[]> {
    return this.workoutService.getWorkout(workoutKey).pipe(
      switchMap(workout => workout.collection<Exercise>('exercises').get()),
      map(exercises => exercises.docs),
      tap(exercises => this.exercisesSubject.next(exercises)),
      switchMap(() => this.getExercises())
    );
  }

  public getExercises(): Observable<QueryDocumentSnapshot<Exercise>[]> {
    return this.exercisesSubject.asObservable();
  }

  public createWorkout(name: string): Observable<string> {
    return this.authService.user$.pipe(
      switchMap(user => this.db.collection('users').doc(user?.uid).collection('workouts').add({name: name})),
      map(workout => workout.id)
    );
  }

  public deleteWorkout(key: string): Observable<void> {
    return this.authService.user$.pipe(
      switchMap(user => this.db.collection('users').doc(user?.uid).collection('workouts').doc(key).ref.delete()),
    );
  }
}