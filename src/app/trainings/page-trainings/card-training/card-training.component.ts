import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, Output, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest, filter, map, merge, share, startWith, switchMap, take, tap } from "rxjs";
import { WorkoutService } from "src/app/data/workout.service";
import { QueryDocumentSnapshot } from "@angular/fire/compat/firestore";
import { Workout } from "src/app/data/interfaces/workout";
import { ExerciseService } from "src/app/data/exercise.service";
import { Exercise } from "src/app/data/interfaces/exercise";
import { ObserversModule } from "@angular/cdk/observers";
import { DeleteDialogComponent } from "../delete-dialog/delete-dialog.component";
import { CompletionService } from "src/app/data/completion.service";

@Component({
  selector: 'app-card-training',
  templateUrl: './card-training.component.html',
  styleUrls: ['./card-training.component.scss'],
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkoutService,
    CompletionService,
  ]
})
export class CardTrainingComponent {
  private readonly dialog = inject(MatDialog);
  private readonly workoutService = inject(WorkoutService);
  private readonly completionService = inject(CompletionService);
  private readonly injector = inject(Injector);

  @Input() set workout(workout: QueryDocumentSnapshot<Workout>) {
    this.workout$.next(workout);
  }

  @Output() deleted = new EventEmitter();

  protected readonly workout$ = new ReplaySubject<QueryDocumentSnapshot<Workout>>(1);

  protected readonly exerciseCount$ = this.workout$.pipe(
    switchMap(workout => this.workoutService.getExerciseCount(workout.id)),
  );

  protected readonly completionCount$ = this.workout$.pipe(
    switchMap(workout => this.completionService.getCompletionCount(workout.id)),
  );

  protected readonly lastCompletion$ = this.workout$.pipe(
    switchMap(workout => this.completionService.getLastCompletion(workout.id)),
    map(completions => completions.length > 0 ? completions[0].data().start.toDate() : null)
  );

  protected readonly avarageDuration$ = this.workout$.pipe(
    switchMap(workout => this.completionService.fetchCompletionsWithId(workout.id)),
    map(completions => {
      if (completions.length == 0) {
        return null;
      }

      let totalTime = 0;

      completions.forEach(c => totalTime += c.data().end.toDate().getTime() - c.data().start.toDate().getTime());

      const averageTime = totalTime / completions.length;
      const hours = Math.floor(averageTime / (1000 * 60 * 60));
      const minutes = Math.floor((averageTime % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes}min`;
    })
  );

  protected getDuration(startDate: Date, endDate: Date): string {
    const timeDiffMs = endDate.getTime() - startDate.getTime();

    const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}min`;
  }

  protected openDeleteDialog(workout: QueryDocumentSnapshot<Workout>): void {
    this.dialog.open(DeleteDialogComponent, {
      data: workout,
      injector: this.injector
    }).afterClosed().pipe(
      take(1),
      filter(deleted => deleted),
      tap(() => this.deleted.emit()),
      take(1),
    )
    .subscribe();
  }
}