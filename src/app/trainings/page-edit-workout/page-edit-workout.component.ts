import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Injector, inject } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { ReplaySubject, combineLatest, filter, map, merge, share, startWith, switchMap, take, tap, withLatestFrom } from "rxjs";
import { WorkoutService } from "src/app/data/workout.service";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { ExerciseTableComponent } from "../exercise-table/exercise-table.component";
import { ExerciseService } from "src/app/data/exercise.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CreateOrEditDialogComponent } from "./create-or-edit-dialog/create-or-edit-dialog.component";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Exercise } from "src/app/data/interfaces/exercise";
import { DeleteDialogComponent } from "./delete-dialog/delete-dialog.component";
import { QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Workout } from "src/app/data/interfaces/workout";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

@Component({
  selector: 'app-page-edit-workout',
  templateUrl: './page-edit-workout.component.html',
  styleUrls: ['./page-edit-workout.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    ExerciseTableComponent,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    MatSlideToggleModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkoutService,
    ExerciseService,
  ]
})
export class PageEditWorkoutComponent {
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly workoutService = inject(WorkoutService);
  private readonly exerciseService = inject(ExerciseService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly injector = inject(Injector);

  protected step = 1;

  protected readonly exercisesForm = new FormGroup({
    exercises: new FormArray([])
  });

  protected readonly workoutForm = new FormGroup({
    name: new FormControl<string | null>(null, Validators.required),
    pause: new FormControl<number | null>(null),
  });

  private readonly refreshWorkout = new EventEmitter();

  protected readonly workout$ = this.refreshWorkout.pipe(
    startWith(true),
    switchMap(() => this.workoutService.getWorkoutData()),
    tap(workout => this.workoutForm.patchValue(workout as Workout)),
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly exercises$ = this.exerciseService.fetchExercises().pipe(
    map(exercises => exercises.sort((a,b) => a.data().order - b.data().order)),
    tap(exercises => exercises.forEach(e => this.exercisesForm.controls.exercises.push(this.buildExerciseFormGroup(e.id, e.data()) as never))),
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly canSubmit$ = combineLatest([this.workoutForm.statusChanges, this.exercisesForm.statusChanges]).pipe(
    startWith(['VALID', this.exercisesForm.status]),
    map(([ws, es]) => ws === 'VALID' && es === 'VALID'),
    share({connector: () => new ReplaySubject(1)})
  );

  private buildExerciseFormGroup(key: string, exercise: Exercise): FormGroup {
    return new FormGroup({
      key: new FormControl(key),
      name: new FormControl(exercise.name),
      order: new FormControl(exercise.order),
      tempo: new FormControl(exercise.tempo),
      rom: new FormControl(exercise.rom),
      sets: new FormControl(exercise.sets),
    });
  }

  protected setStep(index: number) {
    this.step = index;
  }

  protected openCreateDialog(): void {
    this.exercises$.pipe(
      switchMap(exercises => {
        const order = Math.max(...exercises.map(e => e.data().order)) + 1;

        return this.dialog.open(CreateOrEditDialogComponent, {
          data: {
            order: order,
          },
          injector: this.injector
        }).afterClosed()
      }),
      take(1),
      filter(exerciseKey => exerciseKey),
      switchMap(() => this.exerciseService.fetchExercises()),
      take(1),
    )
    .subscribe();
  }

  protected openDeleteDialog(exercise: QueryDocumentSnapshot<Exercise>): void {
      this.dialog.open(DeleteDialogComponent, {
        data: exercise,
        injector: this.injector
      }).afterClosed().pipe(
      take(1),
      filter(deleted => deleted),
      switchMap(() => this.exerciseService.fetchExercises()),
      take(1)
    )
    .subscribe();
  }

  protected submit(): void {
    this.canSubmit$.pipe(
      take(1),
      filter(canSubmit => canSubmit),
      switchMap(() => {
        const edits = this.exercisesForm.getRawValue().exercises.map(e => this.exerciseService.editExercise(e));

        return merge(...edits);
      }),
      switchMap(() => this.workoutService.editWorkout(this.workoutForm.getRawValue() as Workout)),
      tap(() => this.snackBar.open('Anpassungen an den Übungen gespeichert')),
      tap(() => this.refreshWorkout.emit()),
      take(1)
    )
    .subscribe();
  }
}