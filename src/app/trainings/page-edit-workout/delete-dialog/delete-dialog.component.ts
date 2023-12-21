import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AngularFirestore, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { ReplaySubject, filter, map, share, switchMap, take, tap } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { ExerciseService } from "src/app/data/exercise.service";
import { Exercise } from "src/app/data/interfaces/exercise";
import { Workout } from "src/app/data/interfaces/workout";
import { UserDataService } from "src/app/data/user-data.service";
import { WorkoutService } from "src/app/data/workout.service";

@Component({
  selector: 'app-page-trainings-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeleteDialogComponent>);
  private readonly exerciseService = inject(ExerciseService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly dialogData: QueryDocumentSnapshot<Exercise> = inject(MAT_DIALOG_DATA);

  protected delete(): void {
    this.exerciseService.deleteExercise(this.dialogData.id).pipe(
      tap(() => this.snackBar.open('Übung "' + this.dialogData.data().name + '" gelöscht')),
      tap(() => this.dialogRef.close(true))
    )
    .subscribe();
  }
}