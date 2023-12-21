import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
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
import { UserDataService } from "src/app/data/user-data.service";
import { WorkoutService } from "src/app/data/workout.service";

@Component({
  selector: 'app-page-trainings-create-or-edit-dialog',
  templateUrl: './create-or-edit-dialog.component.html',
  styleUrls: ['./create-or-edit-dialog.component.scss'],
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
export class CreateOrEditDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateOrEditDialogComponent>);
  private readonly exerciseService = inject(ExerciseService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly dialogData: {order: number, exercise?: Exercise} = inject(MAT_DIALOG_DATA);

  protected readonly nameFormControl = new FormControl<string>('', {validators: Validators.required})
  protected readonly formControlIsValid$ = this.nameFormControl.statusChanges.pipe(
    map(status => status === 'VALID'),
    share({connector: () => new ReplaySubject(1)})
  );

  protected create(): void {
    this.formControlIsValid$.pipe(
      take(1),
      filter((isValid) => isValid),
      switchMap(() => this.exerciseService.createExercise(this.nameFormControl.value as string, this.dialogData.order)),
      tap(() => this.snackBar.open('Übung "' + this.nameFormControl.value + '" hinzugefügt')),
      tap(exerciseId => this.dialogRef.close(exerciseId))
    )
    .subscribe();
  }
}