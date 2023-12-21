import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormArray, FormControl, FormGroup, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { BehaviorSubject, ReplaySubject, Subscription, map, share, startWith, tap } from "rxjs";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [     
    {       
      provide: NG_VALUE_ACCESSOR, 
      useExisting: ExerciseTableComponent,
      multi: true     
    },
    {
      provide: NG_VALIDATORS,
      useExisting: ExerciseTableComponent,
      multi: true,
    }  
  ]    
})
export class ExerciseTableComponent implements ControlValueAccessor, OnInit, OnDestroy, Validator {
  protected readonly form = new FormGroup({
    sets: new FormArray([])
  });

  @Input() public set placholderData(data: any[]){
    this.placeholderData$.next(data);
  }

  protected readonly placeholderData$ = new BehaviorSubject<any[]>([]);
  
  protected readonly displayedColumns = ['set', 'weight', 'reps'];

  protected readonly updateDataSource = new EventEmitter();
  protected readonly dataSource$ = this.updateDataSource.pipe(
    startWith(true),
    map(() => this.form.controls.sets.controls),
    share({connector: () => new ReplaySubject<AbstractControl[]>(1)})
  );

  protected isDisabled$ = new BehaviorSubject<boolean>(false);

  public onChange: any = (sets: any[]) => {};
  public onTouch: any = () => {};
  public onValidation: any = () => {};

  private readonly subs = new Subscription();

  public ngOnInit(): void {
    this.subs.add(
      this.form.valueChanges.pipe(
        tap(() => this.onTouch()),
        tap(() => this.onChange(this.form.getRawValue().sets)),
        tap(() => this.onValidation()),
      )
      .subscribe()
    );
  }

  private buildSetFormGroup(order?: number): FormGroup {
    return new FormGroup({
      order: new FormControl<number | undefined>({value: order, disabled: true}, {validators: Validators.required}),
      weight: new FormControl<number | null>(null, {validators: Validators.required}),
      reps: new FormControl<number | null>(null, {validators: Validators.required}),
    });
  }

  protected addSet(): void {
    const setNumber = this.form.controls.sets.length ? this.form.controls.sets.length + 1 : 1;
    this.form.controls.sets.push(this.buildSetFormGroup(setNumber) as never);
    this.updateDataSource.emit();
  }

  protected removeSet(): void {
    const setNumber = this.form.controls.sets.length - 1;
    this.form.controls.sets.removeAt(setNumber);
    this.updateDataSource.emit();
  }

  writeValue(value: any[]){
    value.forEach(() => this.addSet());
    const sets = {sets: value as never[]};
    this.form.setValue(sets, {emitEvent: false});
    this.onTouch();
  }

  registerOnTouched(fn: any){
    this.onTouch = fn;
  }

  registerOnChange(fn: any){
    this.onChange = fn;
  }

  validate(): ValidationErrors | null {
    return this.form.valid ? null : {'values missing': false};
  }

  registerOnValidatorChange(fn: any): void {
    this.onValidation = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled$.next(isDisabled);

    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
      this.form.controls.sets.controls.forEach(s => (s as FormGroup).controls['order'].disable());
    }
  }

  public ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}