import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { ReplaySubject, filter, map, share, switchMap, take, tap } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { UserDataService } from "src/app/data/user-data.service";
import { WorkoutService } from "src/app/data/workout.service";

@Component({
  selector: 'app-page-trainings-create-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.scss'],
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CreateDialogComponent>);
  private readonly workoutService = inject(WorkoutService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly nameFormControl = new FormControl<string>('', {validators: Validators.required})
  protected readonly formControlIsValid$ = this.nameFormControl.statusChanges.pipe(
    map(status => status === 'VALID'),
    share({connector: () => new ReplaySubject(1)})
  );

  protected create(): void {
    this.formControlIsValid$.pipe(
      take(1),
      filter((isValid) => isValid),
      switchMap(() => this.workoutService.createWorkout(this.nameFormControl.value as string)),
      tap(() => this.snackBar.open('Training "' + this.nameFormControl.value + '" erstellt')),
      tap(workoutId => this.dialogRef.close(workoutId))
    )
    .subscribe();
  }
}