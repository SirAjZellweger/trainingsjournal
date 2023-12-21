import { Injectable, inject } from "@angular/core";
import { Completion } from "./interfaces/completion";
import { BehaviorSubject, Observable, ReplaySubject, map, merge, of, share, switchMap, tap } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { WorkoutService } from "./workout.service";
import { DocumentReference, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { Exercise } from "./interfaces/exercise";

@Injectable({
  providedIn: 'root',
})
export class CompletionService {
  private readonly workoutService = inject(WorkoutService)

  private readonly completionsSubject = new BehaviorSubject<QueryDocumentSnapshot<Completion>[]>([]);


  // public getWorkoutData(key: string): Observable<Workout | undefined> {
  //   return this.getWorkout(key).pipe(
  //     switchMap(workout => workout.ref.get()),
  //     map(workout => workout.data())
  //   );
  // }

  public getCompletion(key: string): Observable<Completion | undefined> {
    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection<Completion>('completions').doc(key).ref.get()),
      map(completion => completion.data())
    );
  }

  public getLatestCompletions(): Observable<QueryDocumentSnapshot<Completion>[]> {
    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection<Completion>('completions').ref.orderBy("end", "desc").limit(1).get()),
      map(completion => completion.docs)
    );
  }

  public getFirstCompletion(): Observable<QueryDocumentSnapshot<Completion>> {
    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection<Completion>('completions').ref.orderBy("end", "asc").limit(1).get()),
      map(completion => completion.docs[0])
    );
  }

  public getCompletionExercises(key: string): Observable<QueryDocumentSnapshot<Exercise>[]> {
    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection<Completion>('completions').doc(key).collection<Exercise>('exercises').get()),
      map(exercises => exercises.docs)
    );
  }


  public fetchCompletions(): Observable<QueryDocumentSnapshot<Completion>[]> {
    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection<Completion>('completions').get()),
      map(completions => completions.docs),
      tap(completions => this.completionsSubject.next(completions)),
      switchMap(() => this.getCompletions())
    );
  }

  public getCompletions(): Observable<QueryDocumentSnapshot<Completion>[]> {
    return this.completionsSubject.asObservable();
  }

  public createCompletion(completion: Completion): Observable<void> {
    return this.workoutService.getWorkout().pipe(
      switchMap(workout => workout.collection('completions').add({start: completion.start, end: completion.end})),
      switchMap(c => {
        const adds = completion.exercises.map(e => c.collection('exercises').doc(e.key).set(e));

        return merge(...adds);
      })
    );
  }
}