import { Injectable, inject } from "@angular/core";
import { UserDataService } from "./user-data.service";
import { BehaviorSubject, Observable, map, switchMap, tap } from "rxjs";
import { AngularFirestoreDocument, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { Workout } from "./interfaces/workout";

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private readonly userDataService = inject(UserDataService)

  private readonly workoutsSubject = new BehaviorSubject<QueryDocumentSnapshot<Workout>[]>([]);

  public getWorkoutData(key: string): Observable<Workout | undefined> {
    return this.getWorkout(key).pipe(
      switchMap(workout => workout.ref.get()),
      map(workout => workout.data())
    );
  }

  public getWorkout(key: string): Observable<AngularFirestoreDocument<Workout>> {
    return this.userDataService.getUserData().pipe(
      map(userData => userData.collection<Workout>('workouts').doc(key)),
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

  public getWorkouts(): Observable<QueryDocumentSnapshot<Workout>[]> {
    return this.workoutsSubject.asObservable();
  }

  public createWorkout(name: string): Observable<string> {
    return this.userDataService.getUserData().pipe(
      switchMap(userData => userData.collection('workouts').add({name: name})),
      map(workout => workout.id)
    );
  }

  public deleteWorkout(key: string): Observable<void> {
    return this.userDataService.getUserData().pipe(
      switchMap(userData => userData.collection('workouts').doc(key).ref.delete()),
    );
  }
}