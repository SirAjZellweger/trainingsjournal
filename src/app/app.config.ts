import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getAuth, provideAuth } from "@angular/fire/auth";
import { BrowserModule } from "@angular/platform-browser";
import { provideAnimations } from "@angular/platform-browser/animations";
import { Routes, provideRouter } from "@angular/router";
import { environment } from '../environments/environment';
import { FIREBASE_OPTIONS } from "@angular/fire/compat";
import { PageSettingsComponent } from "./settings/page-settings/page-settings.component";
import { SETTING_ROUTES } from "./settings/routes";
import { PageTrainingsComponent } from "./trainings/page-trainings/page-trainings.component";
import { TRAINING_ROUTES } from "./trainings/routes";
import { PageCompleteWorkoutComponent } from "./trainings/page-complete-workout/page-complete-workout.component";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { redirectUnauthorizedTo, canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { PageLoginComponent } from "./auth/page-login/page-login.component";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { PageEditWorkoutComponent } from "./trainings/page-edit-workout/page-edit-workout.component";

const redirectAuthorizedToHome = () => redirectLoggedInTo(['']);
const redirectUnauthorizedToHome = () => redirectUnauthorizedTo(['']);

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '' },
  { path: 'login', component: PageLoginComponent , ...canActivate(redirectAuthorizedToHome)},
  { path: 'trainings', component: PageTrainingsComponent, loadChildren: () => TRAINING_ROUTES , ...canActivate(redirectUnauthorizedToHome)},
  { path: 'trainings/edit/:id', component: PageEditWorkoutComponent, loadChildren: () => TRAINING_ROUTES , ...canActivate(redirectUnauthorizedToHome)},
  { path: 'complete-workout', component: PageCompleteWorkoutComponent , ...canActivate(redirectUnauthorizedToHome)},
  { path: 'settings', component: PageSettingsComponent, loadChildren: () => SETTING_ROUTES, ...canActivate(redirectUnauthorizedToHome) },
  { path: '**', redirectTo: ''}
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      BrowserModule,
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideAuth(() => getAuth()),
      AngularFirestoreModule
    ),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 3000, horizontalPosition: 'start', verticalPosition: 'bottom'} },
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'} },
    provideAnimations()
  ]
}