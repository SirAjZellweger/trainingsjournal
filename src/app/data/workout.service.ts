import { Injectable, inject } from "@angular/core";
import { UserDataService } from "./user-data.service";
import { BehaviorSubject, Observable, ReplaySubject, map, share, switchMap, take, tap, withLatestFrom } from "rxjs";
import { AngularFirestoreDocument, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { Workout } from "./interfaces/workout";
import { ActivatedRoute } from "@angular/router";
import { Exercise } from "./interfaces/exercise";

@Injectable()
export class WorkoutService {
  private readonly route = inject(ActivatedRoute);
  private readonly userDataService = inject(UserDataService)

  private readonly workoutKey$ = this.route.params.pipe(
    map(p => p['id']),
    share({connector: () => new ReplaySubject(1)})
  );

  private readonly workoutsSubject = new BehaviorSubject<QueryDocumentSnapshot<Workout>[]>([]);

  public getWorkoutData(): Observable<Workout | undefined> {
    return this.getWorkout().pipe(
      switchMap(workout => workout.ref.get()),
      map(workout => workout.data()),
    );
  }

  public getWorkout(): Observable<AngularFirestoreDocument<Workout>> {
    return this.userDataService.getUserData().pipe(
      withLatestFrom(this.workoutKey$),
      map(([userData, key]) => userData.collection<Workout>('workouts').doc(key)),
    );
  }

  public fetchWorkouts(): Observable<QueryDocumentSnapshot<Workout>[]> {
    return this.userDataService.getUserData().pipe(
      switchMap(userData => userData.collection<Workout>('workouts').get()),
      map(workouts => workouts.docs),
      tap(workouts => this.workoutsSubject.next(workouts)),
      switchMap(() => this.getWorkouts())
    );
  }

  public getExerciseCount(key: string): Observable<number> {
    return this.userDataService.getUserData().pipe(
      switchMap(userData => userData.collection<Workout>('workouts').doc(key).collection<Exercise>('exercises').get()),
      map(exercises => exercises.size),
    );
  }

  public getWorkouts(): Observable<QueryDocumentSnapshot<Workout>[]> {
    return this.workoutsSubject.asObservable();
  }

  public createWorkout(name: string): Observable<string> {
    return this.userDataService.getUserData().pipe(
      switchMap(userData => userData.collection('workouts').add({name: name})),
      map(workout => workout.id)
    );
  }

  public editWorkout(workout: Workout): Observable<void> {
    return this.getWorkout().pipe(
      switchMap(w => w.set(workout)),
    );
  }

  public deleteWorkout(key: string): Observable<void> {
    return this.userDataService.getUserData().pipe(
      switchMap(userData => userData.collection('workouts').doc(key).ref.delete()),
    );
  }
}