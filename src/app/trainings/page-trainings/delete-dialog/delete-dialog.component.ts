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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeleteDialogComponent>);
  private readonly workoutService = inject(WorkoutService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly dialogData: QueryDocumentSnapshot<Workout> = inject(MAT_DIALOG_DATA);

  protected delete(): void {
    this.workoutService.deleteWorkout(this.dialogData.id).pipe(
      tap(() => this.snackBar.open('Training "' + this.dialogData.data().name + '" gelöscht')),
      tap(() => this.dialogRef.close(true))
    )
    .subscribe();
  }
}