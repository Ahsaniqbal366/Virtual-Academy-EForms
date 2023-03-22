import { Directive } from '@angular/core';
import { NG_VALIDATORS, ValidationErrors, Validator, FormControl } from '@angular/forms';

@Directive({
  selector: '[validNumberPositive]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: FormFieldValidate_Number_Positive, multi: true }
  ]
})
export class FormFieldValidate_Number_Positive implements Validator {

  validate(c: FormControl): ValidationErrors | null {
    return FormFieldValidate_Number_Positive.validate(c);
  }

  static validate(control: FormControl): ValidationErrors | null {
    const value = control.value || '';
    const parsedValue = parseFloat(value);
    if(isNaN(parsedValue)){
      // ERROR: Value doesn't appear to be a number.
      return { number_positive: 'Value must be a number.' };
    }
    else if (parsedValue < 0) {
      // ERROR: Value is negative.
      return { number_positive: 'Value cannot be negative.' };
    }
    // If no error, return null
    return null;
  }
}