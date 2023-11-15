import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AuthService } from "../auth.service";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReplaySubject, filter, map, share, startWith, switchMap, take, tap } from "rxjs";
import { Router } from "@angular/router";
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatDividerModule } from "@angular/material/divider";

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  standalone: true,
  selector: 'app-page-login',
  templateUrl: './page-login.component.html',
  styleUrls: ['./page-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
  ]
})
export class PageLoginComponent {
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  protected readonly matcher = new MyErrorStateMatcher();

  protected readonly loginForm = new FormGroup({
    email: new FormControl<string>('', {validators: [Validators.required, Validators.email]}),
    password: new FormControl<string>('', {validators: Validators.required}),
  });

  protected readonly registerForm = new FormGroup({
    email: new FormControl<string>('', {validators: [Validators.required, Validators.email]}),
    password: new FormControl<string>('', {validators: [Validators.required, Validators.minLength(6)]}),
    passwordRepetition: new FormControl<string>('', {validators: Validators.required}),
  }, {validators: this.comparePassword("password", "passwordRepetition")});

  protected readonly canSubmitLoginForm = this.loginForm.statusChanges.pipe(
    startWith(this.loginForm.status),
    map(status => status === 'VALID'),
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly canSubmitRegisterForm = this.registerForm.statusChanges.pipe(
    startWith(this.registerForm.status),
    map(status => status === 'VALID'),
    share({connector: () => new ReplaySubject(1)})
  );

  protected loginWithGoogle(): void {
    this.authService.signInWithGoogle().pipe(
      take(1),
      tap(() => this.snackBar.open('Erfolgreich angemeldet')),
      tap(() => this.router.navigate(['']))
    ).subscribe();
  }

  protected signInWithEmailAndPassword(): void {
    this.canSubmitLoginForm.pipe(
      take(1),
      filter(canSubmit => canSubmit),
      switchMap(() => this.authService.signInWithEmailAndPassword(this.loginForm.controls.email.value, this.loginForm.controls.password.value)),
      take(1),
      tap(() => this.snackBar.open('Erfolgreich angemeldet')),
      tap(() => this.router.navigate(['']))
    ).subscribe();
  }

  protected createUserWithEmailAndPassword(): void {
    this.canSubmitRegisterForm.pipe(
      take(1),
      filter(canSubmit => canSubmit),
      switchMap(() => this.authService.createUserWithEmailAndPassword(this.registerForm.controls.email.value, this.registerForm.controls.password.value)),
      take(1),
      tap(() => this.snackBar.open('Erfolgreich registriert')),
      tap(() => this.router.navigate(['']))
    ).subscribe();
  }

  private comparePassword(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl) : ValidationErrors | null=> {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (control?.value !== matchingControl?.value) {
        matchingControl?.setErrors({ mustMatch: true });
        return { mustMatch: true };
      } else {
        matchingControl?.setErrors(null);
        return null;
      }
    };
}

}