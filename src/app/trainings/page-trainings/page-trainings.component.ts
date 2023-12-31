import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Injector, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateDialogComponent } from "./create-dialog/create-dialog.component";
import { BehaviorSubject, Observable, combineLatest, filter, map, merge, share, startWith, switchMap, take, tap } from "rxjs";
import { WorkoutService } from "src/app/data/workout.service";
import { DeleteDialogComponent } from "./delete-dialog/delete-dialog.component";
import { QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { Workout } from "src/app/data/interfaces/workout";
import { ExerciseService } from "src/app/data/exercise.service";
import { Exercise } from "src/app/data/interfaces/exercise";
import { ObserversModule } from "@angular/cdk/observers";
import { CardTrainingComponent } from "./card-training/card-training.component";
import { MatToolbarModule } from "@angular/material/toolbar";

@Component({
  selector: 'app-page-trainings',
  templateUrl: './page-trainings.component.html',
  styleUrls: ['./page-trainings.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatToolbarModule,
    CardTrainingComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkoutService,
  ]
})
export class PageTrainingsComponent {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly workoutService = inject(WorkoutService);
  private readonly injector = inject(Injector);

  protected refreshWorkouts = new EventEmitter();

  protected readonly workouts$ = this.refreshWorkouts.pipe(
    startWith(null),
    switchMap(() => this.workoutService.fetchWorkouts()),
    share({connector: () => new BehaviorSubject<QueryDocumentSnapshot<Workout>[]>([])})
  );

  protected openCreateDialog(): void {
    this.dialog.open(CreateDialogComponent, {
      injector: this.injector
    }).afterClosed().pipe(
      take(1),
      filter(workoutId => workoutId),
      tap(workoutId => this.router.navigate(['edit', workoutId], {relativeTo: this.route}))
    )
    .subscribe();
  }
}