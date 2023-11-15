import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { map, switchMap, tap } from "rxjs";
import { WorkoutService } from "src/app/data/workout.service";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { ExerciseTableComponent } from "../exercise-table/exercise-table.component";
import { ExerciseService } from "src/app/data/exercise.service";

@Component({
  selector: 'app-page-edit-workout',
  templateUrl: './page-edit-workout.component.html',
  // styleUrls: ['./page-trainings.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    ExerciseTableComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageEditWorkoutComponent {
  // private readonly dialog = inject(MatDialog);
  // private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly workoutService = inject(WorkoutService);
  private readonly exerciseService = inject(ExerciseService);

  protected step = 1;

  protected readonly workoutKey$ = this.route.params.pipe(map(p => p['id']));
  protected readonly workout$ = this.workoutKey$.pipe(switchMap(workoutKey => this.workoutService.getWorkout(workoutKey)), tap(console.log));
  protected readonly exercises$ = this.workoutKey$.pipe(switchMap(workoutKey => this.exerciseService.fetchExercises(workoutKey)))

  public constructor() {
    this.exercises$.pipe(tap(e => e.forEach(ex => console.log(ex.data())))).subscribe();
  }

  protected setStep(index: number) {
    this.step = index;
  }

  protected nextStep() {
    this.step++;
  }

  protected prevStep() {
    this.step--;
  }
}