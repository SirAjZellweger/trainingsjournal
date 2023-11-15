import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateDialogComponent } from "./create-dialog/create-dialog.component";
import { BehaviorSubject, combineLatest, filter, map, share, startWith, switchMap, take, tap } from "rxjs";
import { WorkoutService } from "src/app/data/workout.service";
import { DeleteDialogComponent } from "./delete-dialog/delete-dialog.component";
import { QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { Workout } from "src/app/data/interfaces/workout";

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
    MatDialogModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTrainingsComponent {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly workoutService = inject(WorkoutService);

  protected readonly workouts$ = this.workoutService.fetchWorkouts().pipe(
    share({connector: () => new BehaviorSubject<QueryDocumentSnapshot<Workout>[]>([])})
  );

  protected openCreateDialog(): void {
    this.dialog.open(CreateDialogComponent).afterClosed().pipe(
      take(1),
      filter(workoutId => workoutId),
      tap(workoutId => this.router.navigate(['edit', workoutId], {relativeTo: this.route}))
    )
    .subscribe();
  }

  protected openDeleteDialog(workout: QueryDocumentSnapshot<Workout>): void {
    this.dialog.open(DeleteDialogComponent, {
      data: workout
    }).afterClosed().pipe(
      take(1),
      filter(refresh => refresh),
      switchMap(() => this.workoutService.fetchWorkouts()),
      take(1),
    )
    .subscribe();
  }
}