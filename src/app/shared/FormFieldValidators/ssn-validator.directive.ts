import { Directive } from '@angular/core';
import { NG_VALIDATORS, ValidationErrors, Validator, FormControl } from '@angular/forms';

@Directive({
  selector: '[validSSN]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: FormFieldValidate_SSN, multi: true }
  ]
})
export class FormFieldValidate_SSN implements Validator {

  validate(c: FormControl): ValidationErrors | null {
    return FormFieldValidate_SSN.validate(c);
  }

  static validate(control: FormControl): ValidationErrors | null {
    let value = control.value || '';
    // Split on '-' char to filter out any dashes.
    value = value.split('-').join('').trim();
    const isOnlyNumbers = /^\d+$/.test(value);
    const is9Numbers = value.length === 9;
    if (!isOnlyNumbers) {
      // ERROR: Value isn't just numbers (AND DASHES, but we ignored them).
      return { ssn: 'Must only have numbers and dashes.' };
    }
    else if (!is9Numbers) {
      /**
       * ERROR: There aren't exactly 9 numbers.
       * We confirmed value had only numbers (AND DASHES, but we ignored them).
       */
      return { ssn: 'Must be 9 numbers.' };
    }
    // If no error, return null
    return null;
  }
}