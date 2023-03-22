import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
@Injectable()
export class FormFieldValidate_ErrorMessagesService {
    constructor() { }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/

    /*******************************************
    * PUBLIC METHODS
    *******************************************/

    public getFieldErrorMessage(field: AbstractControl): string {
        if (field.hasError('required')) {
            return 'You must enter a value.';
        }        
        else if (field.hasError('email')) {
            return 'Not a valid email.';
        }
        else if (field.hasError('maxlength')) {
            return 'Max length: ' + field.errors['maxlength'].requiredLength + ' chars';
        }
        else if (field.hasError('minlength')) {
            return 'Required length: ' + field.errors['minlength'].requiredLength + ' chars';
        }
        else if (field.hasError('max')) {
            // max => maximum number value.
            return 'Max value: ' + field.errors['max'].max;
        }
        else if (field.hasError('min')) {
            // min => minimum number value.
            return 'Min value: ' + field.errors['min'].min;            
        }
        else if (field.hasError('pattern')) {
            return 'Value contains improper characters.';
        }
        else if (field.hasError('ssn')) {
            return field.errors['ssn'];
        }
        else if (field.hasError('number_positive')) {
            return field.errors['number_positive'];
        }
        return '';
    }

    /*******************************************
    * PRIVATE METHODS
    *******************************************/

    /*******************************************
    * SELF INIT
    *******************************************/
}