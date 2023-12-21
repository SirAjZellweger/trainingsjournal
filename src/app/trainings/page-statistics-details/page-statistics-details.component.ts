import { CommonModule, Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { Observable, ReplaySubject, map, share, switchMap, tap, withLatestFrom } from "rxjs";
import { CompletionService } from "src/app/data/completion.service";
import { Exercise, Set } from "src/app/data/interfaces/exercise";
import { WorkoutService } from "src/app/data/workout.service";
import { ExerciseTableComponent } from "../exercise-table/exercise-table.component";
import { Workout } from "src/app/data/interfaces/workout";

@Component({
  selector: 'app-page-statistics-details',
  templateUrl: './page-statistics-details.component.html',
  styleUrls: ['./page-statistics-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    // MatCardModule,
    MatButtonModule,
    MatIconModule,
    // MatDividerModule,
    // MatTooltipModule,
    // MatDialogModule,
    MatTableModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    ExerciseTableComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkoutService,
    CompletionService
  ]
})
export class PageStatisticsDetailsComponent {
  private readonly workoutService = inject(WorkoutService)
  private readonly completionService = inject(CompletionService)
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location)

  protected readonly exercisesForm = new FormGroup({
    exercises: new FormArray([])
  });

  protected readonly workoutForm = new FormGroup({
    pause: new FormControl<number | null>({value: null, disabled: true}),
  });

  private readonly completionKey$ = this.route.params.pipe(
    map(p => p['cid']),
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly workout$ = this.workoutService.getWorkoutData().pipe(
    tap(workout => this.workoutForm.patchValue(workout as Workout)),
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly completion$ = this.completionKey$.pipe(
    switchMap(completionKey => this.completionService.getCompletion(completionKey)),
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly completionExercises$ = this.completionKey$.pipe(
    switchMap(completionKey => this.completionService.getCompletionExercises(completionKey)),
    map(exercises => exercises.sort((a,b) => a.data().order - b.data().order)),
    tap(exercises => exercises.forEach(e => this.exercisesForm.controls.exercises.push(this.buildExerciseFormGroup(e.id, e.data()) as never))),
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly lastCompletionExercises$ = this.completionService.fetchCompletions().pipe(
    withLatestFrom(this.completionKey$),
    map(([completions, cKey]) => completions[completions.findIndex(c => c.id === cKey) + 1]),
    switchMap(completion => this.completionService.getCompletionExercises(completion.id)),
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly firstCompletionExercises$ = this.completionService.getFirstCompletion().pipe(
    switchMap(completion => this.completionService.getCompletionExercises(completion.id)),
    share({connector: () => new ReplaySubject(1)})
  );

  private buildExerciseFormGroup(key: string, exercise: Exercise): FormGroup {
    return new FormGroup({
      key: new FormControl(key),
      order: new FormControl(exercise.order),
      tempo: new FormControl({value: exercise.tempo, disabled: true}),
      rom: new FormControl({value: exercise.rom, disabled: true}),
      sets: new FormControl({value: exercise.sets, disabled: true}),
    });
  }

  protected getTotalVolume(set: Array<Set> | undefined): number {
    let total = 0;

    set?.forEach(s => total += (s?.reps ?? 0) * (s?.weight ?? 0))

    return total;
  }

  protected getDiffernceToLastCompletion(exercise: Exercise): Observable<number> {
    return this.lastCompletionExercises$.pipe(
      map(exercises => exercises.find(e => e.id === exercise.key)),
      map(e => {
        const lastTotal = this.getTotalVolume(e?.data()?.sets);
        const currentTotal = this.getTotalVolume(exercise?.sets);

        return currentTotal - lastTotal;
      })
    );
  }

  protected getDiffernceToFirstCompletion(exercise: Exercise): Observable<number> {
    return this.firstCompletionExercises$.pipe(
      map(exercises => exercises.find(e => e.id === exercise.key)),
      map(e => {
        const firstTotal = this.getTotalVolume(e?.data()?.sets);
        const currentTotal = this.getTotalVolume(exercise?.sets);

        return currentTotal - firstTotal;
      })
    );
  }

  protected navigateBack(): void {
    this.location.back();
  }
}