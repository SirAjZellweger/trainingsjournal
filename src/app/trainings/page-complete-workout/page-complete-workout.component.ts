import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { ReplaySubject, combineLatest, interval, map, merge, of, share, startWith, switchMap, take, takeWhile, tap } from "rxjs";
import { ExerciseTableComponent } from "../exercise-table/exercise-table.component";
import { WorkoutService } from "src/app/data/workout.service";
import { ExerciseService } from "src/app/data/exercise.service";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Exercise } from "src/app/data/interfaces/exercise";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CompletionService } from "src/app/data/completion.service";
import { Completion } from "src/app/data/interfaces/completion";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";

interface Pause {
  length: number;
  isRunning: boolean;
  step: number;
  timeLeft: number;
}

@Component({
  selector: 'app-page-complete-workout',
  templateUrl: './page-complete-workout.component.html',
  styleUrls: ['./page-complete-workout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatTableModule,
    MatInputModule,
    MatChipsModule,
    MatToolbarModule,
    ExerciseTableComponent,
    MatCardModule,
    MatDividerModule
  ],
  providers: [
    CompletionService,
    ExerciseService,
    WorkoutService,
  ]
})
export class PageCompleteWorkoutComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutService = inject(WorkoutService);
  private readonly exerciseService = inject(ExerciseService);
  private readonly completionService = inject(CompletionService);

  protected readonly completionForm = new FormGroup({
    start: new FormControl(new Date()),
    end: new FormControl(null),
    exercises: new FormArray([])
  });

  protected readonly workout$ = this.workoutService.getWorkoutData().pipe( 
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly exercises$ = this.exerciseService.fetchExercises().pipe(
    map(exercises => exercises.sort((a,b) => a.data().order - b.data().order)),
    tap(exercises => exercises.forEach(e => this.completionForm.controls.exercises.push(this.buildExerciseFormGroup(e.id, e.data()) as never))),
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly pauseIsRunning = new EventEmitter<boolean>();

  protected readonly pause$ = combineLatest([this.workout$.pipe(map(w => w?.pause)), this.pauseIsRunning.pipe(startWith(false))]).pipe(
    switchMap(([duration, isRunning]) => isRunning ? interval(1000).pipe(map(i => ({duration, i, isRunning}))) : of({duration, i: 0, isRunning})),
    map(({duration, i, isRunning}) => {
      const remainingTime = duration as number - i;

      if(remainingTime === 0) {
        this.pauseIsRunning.next(false);

        return { remainingTime: duration, isRunning: false}
      }

      return { remainingTime: remainingTime, isRunning: isRunning}
    }),
  )

  private buildExerciseFormGroup(key: string, exercise: Exercise): FormGroup {
    return new FormGroup({
      key: new FormControl(key),
      name: new FormControl(exercise.name),
      order: new FormControl(exercise.order),
      tempo: new FormControl(exercise.tempo),
      rom: new FormControl(exercise.rom),
      sets: new FormControl(exercise.sets.map(s => ({...s, reps: null, weight: null }))),
    });
  }

  protected submit(): void {
    this.completionService.createCompletion({...this.completionForm.value, end: new Date()} as Completion).pipe(
      switchMap(() => {
        const edits = this.completionForm.getRawValue().exercises.map(e => this.exerciseService.editExercise(e));

        return merge(...edits)
      }),
      take(1),
      tap(() => this.router.navigate(['/trainings'])),
    ).subscribe();
  }

  // protected getExerciseFormGroup(index: number): FormGroup {
  //   const test = this.completionForm.controls.exercises.controls[index] as never;


  //   return this.completionForm.controls.exercises.controls[index];
  // }

  // TOOD set completed state of step
}