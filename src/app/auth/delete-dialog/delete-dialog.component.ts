import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AngularFirestore, QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { ReplaySubject, catchError, filter, map, of, share, switchMap, take, tap } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { Workout } from "src/app/data/interfaces/workout";
import { UserDataService } from "src/app/data/user-data.service";
import { WorkoutService } from "src/app/data/workout.service";

@Component({
  selector: 'app-page-trainings-delete-user-dialog',
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
    MatSnackBarModule,
    MatFormFieldModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeleteDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly userDataService = inject(UserDataService);
  private readonly authService = inject(AuthService);

  protected passwordFormControl = new FormControl<string | null>(null);

  protected delete(): void {
    this.userDataService.deleteUserData().pipe(
      // switchMap(() => this.authService.deleteUser(this.passwordFormControl.value as string)),
      take(1),
      tap(() => this.snackBar.open('Benutzerkonto gelöscht')),
      tap(() => this.dialogRef.close()),
      catchError(e => of(null).pipe(tap(() => this.snackBar.open('Das Passwort ist falsch')))),
    ).subscribe()
  }
}