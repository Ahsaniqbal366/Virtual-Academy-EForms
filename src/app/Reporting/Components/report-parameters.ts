import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalController, AlertController, IonInput } from '@ionic/angular';
import { ReportingProvider as ReportingProvider } from '../Providers/reporting.service';
import { LoadingService } from 'src/app/shared/Loading.Service';

// define component
@Component({
  selector: 'report-parameters',
  templateUrl: 'report-parameters.html',
  styleUrls: ['../reporting.page.scss']
})

export class ReportParameters implements OnInit {

  // define service provider and route provider when component is constructed
  constructor(
    private _loadingService: LoadingService,
    public reportingProvider: ReportingProvider) {
  }

  // show/hide the completion status date range as it is unnecessary for some report types 
  @Input() showCompletionStatus: boolean  = true;

  // used to switch the parameter view between "Stock" and "Acadis" view. They share some of the same components
  // but the "Acadis" view has some additional properties
  @Input() mode: string = "Stock";

  public initialized: boolean;

  // list of available year selections. The limit is set to the past 5 years, as defined
  // by the [_setupYearList]
  public yearList: string[];

  // when the filter button is clicked, this event will be emitted to allow
  // the parent component to perform it's filter action
  @Output() onFiltersApplied: EventEmitter<any> = new EventEmitter();

  /** PUBLIC METHODS */

  /**
   * [onApplyBtnClick] is triggered when the "Generate" button is clicked. It emits
   * an event to the parent component to signify that the report should be regenerated.
   */
  public onApplyBtnClick(){
    this.onFiltersApplied.emit();
  }

  /** PRIVATE METHODS */
  private _setupYearList() {
    var max = new Date().getFullYear()
    var min = max - 5
    var years = []
  
    for (var i = max; i >= min; i--) {
      years.push(i)
    }

    return years;
  }
  
  /** SELF INIT */
  ngOnInit() {
    this.yearList = this._setupYearList();
  }

  ngAfterViewInit(){

  }

}
