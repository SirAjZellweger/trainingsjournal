import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input } from "@angular/core";
import { AbstractControl, FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { ReplaySubject, map, share, startWith } from "rxjs";

@Component({
  selector: 'app-exercise-table',
  templateUrl: './exercise-table.component.html',
  styleUrls: ['./exercise-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExerciseTableComponent {
  protected readonly form = new FormGroup({
    sets: new FormArray([
      this.buildSetFormGroup(1),
      this.buildSetFormGroup(2),
      this.buildSetFormGroup(3),
    ])
  });

  @Input() public set data(data: any){
    this.form.patchValue(data);
  }
  
  protected readonly displayedColumns = ['set', 'weight', 'reps'];

  protected readonly updateDataSource = new EventEmitter();
  protected readonly dataSource$ = this.updateDataSource.pipe(
    startWith(true),
    map(() => this.form.controls.sets.controls),
    share({connector: () => new ReplaySubject<AbstractControl[]>(1)})
  );

  private buildSetFormGroup(set: number): FormGroup {
    return new FormGroup({
      set: new FormControl<number>({value: set, disabled: true}, {validators: Validators.required}),
      weight: new FormControl<number | null>(40, {validators: Validators.required}),
      reps: new FormControl<number | null>(10, {validators: Validators.required}),
    });
  }

  protected addSet(): void {
    const setNumber = this.form.controls.sets.length + 1;
    this.form.controls.sets.push(this.buildSetFormGroup(setNumber));
    this.updateDataSource.emit();
  }

  protected removeSet(): void {
    const setNumber = this.form.controls.sets.length - 1;
    this.form.controls.sets.removeAt(setNumber);
    this.updateDataSource.emit();
  }
}