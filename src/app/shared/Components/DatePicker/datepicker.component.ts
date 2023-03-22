import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import { DatePipe } from '@angular/common'
import { isNullOrUndefined } from 'is-what';

@Component({
  selector: 'app-datepicker-button',
  templateUrl: 'datepicker.component.html',
  styleUrls: ['datepicker.component.scss'],
})
export class AppDatePickerComponent implements OnInit {

  /**
   * JTC 05/06/2020
   * -----
   * Regarding date format 'MM/dd/yyyy' vs. 'MM-dd-yyyy'.
   * 
   * We had a ticket where submitting a forms that used this datepicker was failing on iOS.
   * 
   * This is because [new Date('MM-dd-yyyy')] returns 'Invalid Date' on iOS.
   * 
   * However, [new Date('MM/dd/yyyy')] returns a valid date, when appropriate on iOS so we are going 
   * to use the 'MM/dd/yyyy' format in this code.
   */

  // Takes the place of the ngModel as the value
  @Input() inputDate: string;

  // Set to disable to datepicker and make it read only
  @Input() disabled: boolean;

  // Used to emit the new date pack to the parent component
  // https://itnext.io/angular-input-output-f0418ab4cc91
  @Output() outputDate: EventEmitter<string> = new EventEmitter();

  // The parsed date
  parsedInputDate: Date;

  // The output chosen date
  selectedDate: string;

  // Holds the converted value for the manually entered date
  convertedInput: string;

  // Disabled dates, configureable
  disabledDates: Date[];

  // Datepicker options, configurable
  datePickerObj: any;

  // Flag for error status indicating invalid date
  hasError: boolean;

  constructor(
    public modalCtrl: ModalController,
    public datepipe: DatePipe
  ) { }

  ngOnInit() {
    if (!isNullOrUndefined(this.inputDate) && this.inputDate.length !== 0) {
      // Let's ensure our date is correctly formatted
      this.parsedInputDate = new Date(this.inputDate);

      /**
       * In case the user exits without a selection, set [selectedDate] to the parsed date.
       * ----
       * JTC - We have to use MM/dd/yyyy for iOS compatibility. See above for more details.
       */
      this.selectedDate = this._convertDate(this.parsedInputDate, 'MM/dd/yyyy');
    }

    this.disabledDates = [
      /**
       * EXAMPLES
       *       
       * new Date(1545911005644),
       * new Date(),
       * new Date(2018, 12, 12), // Months are 0-based, this is August, 10th.
       * new Date('Wednesday, December 26, 2018'), // Works with any valid Date formats like long format
       * new Date('12-14-2018'), // Short format
       */
    ];

    this.datePickerObj = {
      inputDate: this.parsedInputDate, // default new Date()
      fromDate: null, // default null
      toDate: null, // default null
      showTodayButton: true, // default true
      closeOnSelect: false, // default false
      disableWeekDays: [], // default []
      mondayFirst: false, // default false
      setLabel: 'Set',  // default 'Set'
      todayLabel: 'Today', // default 'Today'
      closeLabel: 'Close', // default 'Close'
      disabledDates: [], // default []
      titleLabel: null, // default null
      monthsList: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
      weeksList: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      // JTC - We have to use MM/DD/YYYY for iOS compatibility. See above for more details.
      dateFormat: 'MM/DD/YYYY', // default DD MMM YYYY
      clearButton: true, // default true
      momentLocale: 'en-US', // Default 'en-US'
      yearInAscending: false, // Default false
      btnCloseSetInReverse: false, // Default false
      btnProperties: {
        expand: 'block', // Default 'block'
        fill: 'solid', // Default 'solid'
        size: 'default', // Default 'default'
        disabled: false, // Default false
        strong: false, // Default false
        color: '' // Default ''
      },
      arrowNextPrev: {
        nextArrowSrc: 'assets/images/arrow_right.svg',
        prevArrowSrc: 'assets/images/arrow_left.svg'
      }, // This object supports only SVG files.
      highlightedDates: [
        /**
         * EXAMPLES
         * { date: new Date('2019-09-10'), color: '#ee88bf', fontColor: '#fff' },
         * { date: new Date('2019-09-12'), color: '#50f2b1', fontColor: '#fff' }
         */
      ], // Default [],
      isSundayHighlighted: {
        /** 
         * EXAMPLE
         * fontColor: null // Default null
         */
      } // Default {}
    };
  }

  /** Click event for the date button */
  async openDatePicker() {
    // Creates the datepicker modal
    const datePickerModal = await this.modalCtrl.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: {
        objConfig: this.datePickerObj,
        selectedDate: this.selectedDate
      }
    });
    await datePickerModal.present();

    /** On dismiss, pass the selected date back */
    datePickerModal.onDidDismiss()
      .then((data) => {
        // Emit the change, unless it was changed to invalid
        if (data.data.date !== 'Invalid date') {
          this.selectedDate = data.data.date;
          this.outputDate.emit(this.selectedDate);
          // Everything checks out, clear the error flag.
          this.hasError = false;
        } else {
          this.outputDate.emit(this.inputDate);
        }
      });
  }

  /** Input Event for the input for date, check to see if date is valid and flag errored if not */
  onDateInput() {
    // JTC - We have to use MM/dd/yyyy for iOS compatibility. See above for more details.
    this.convertedInput = this._convertDate(this.selectedDate, 'MM/dd/yyyy')
    this.outputDate.emit(this.convertedInput);
  }

  private _convertDate(dateToConvert: any, format: string): string {
    let returnValue = '';
    try {
      returnValue = this.datepipe.transform(dateToConvert, format);

      /**
       * Confirm the [returnValue] can be parsed into a date. Not all browsers/devices
       * can use [new Date('string')] to parse all NORMAL date formats. For example, iOS
       * doesn't like the 'MM-dd-yyyy' format.
       * We rely on [new Date('string')] so we need to confirm it will work now, or throw up 
       * an error.
       */
      var parsedDate = new Date(returnValue);
      if (parsedDate.toString() === 'Invalid Date') {
        // Date couldn't be parsed.
        this.hasError = true;        
      }
      else{
        // Everything checks out, clear the error flag.
        this.hasError = false;
      }
    }
    catch (error) {
      this.hasError = true;
    }

    // An error was found, return the fallback value of [this.inputDate].
    if(this.hasError) {
      returnValue = this.inputDate;
    }

    return returnValue;
  }
}
