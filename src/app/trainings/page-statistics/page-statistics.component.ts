import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterModule } from "@angular/router";
import { ReplaySubject, share } from "rxjs";
import { CompletionService } from "src/app/data/completion.service";
import { WorkoutService } from "src/app/data/workout.service";

@Component({
  selector: 'app-page-statistics',
  templateUrl: './page-statistics.component.html',
  styleUrls: ['./page-statistics.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatToolbarModule,
    // MatCardModule,
    MatButtonModule,
    MatIconModule,
    // MatDividerModule,
    // MatTooltipModule,
    // MatDialogModule,
    MatTableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    WorkoutService,
    CompletionService
  ]
})
export class PageStatisticsComponent {
  private readonly workoutService = inject(WorkoutService)
  private readonly completionService = inject(CompletionService)

  protected readonly displayedColumns = ['date', 'duration', 'details'];

  protected readonly workout$ = this.workoutService.getWorkoutData().pipe(
    share({connector: () => new ReplaySubject(1)})
  );

  protected readonly completions$ = this.completionService.fetchCompletions().pipe(
    share({connector: () => new ReplaySubject(1)})
  );

  protected getDuration(startDate: Date, endDate: Date): string {
    const timeDiffMs = endDate.getTime() - startDate.getTime();

    const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}min`;
  }
}