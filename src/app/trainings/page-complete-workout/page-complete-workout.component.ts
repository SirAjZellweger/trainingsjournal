import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';

@Component({
  selector: 'app-page-complete-workout',
  templateUrl: './page-complete-workout.component.html',
  styleUrls: ['./page-complete-workout.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatTableModule,
    MatInputModule,
    MatChipsModule
  ]
})
export class PageCompleteWorkoutComponent {
  protected displayedColumns: string[] = ['set', 'weight', 'reps'];
  protected pushups = [
    {set: 1, reps: null},
    {set: 2, reps: null},
    {set: 3, reps: null}
  ]
}