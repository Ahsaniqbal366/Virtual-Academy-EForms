import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonInput } from '@ionic/angular';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ReportingProvider as ReportingProvider } from '../../../Providers/reporting.service';
import { HttpResponse } from '@angular/common/http';
import { LoadingService } from 'src/app/shared/Loading.Service';

// define component
@Component({
  selector: 'report-parameters-dialog',
  templateUrl: 'report-parameters-dialog.html',
  styleUrls: ['../../../reporting.page.scss']
})

export class ReportParametersDialog implements OnInit {

  // define service provider and route provider when component is constructed
  constructor(
    private _modalCtrl: ModalController,
    private _loadingService: LoadingService,
    public reportingProvider: ReportingProvider) {
  }

  public initialized: boolean;

  /**
   * ASYNC: Close this modal, return "new data"* and [confirmed] flag to
   * flag to indicate that the user submitted the dialog, as opposed to cancelled it.
   *
   * "new data"* might not be returned if the user cancelled the action.
   */
  public async dismiss(confirmed) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    await this._modalCtrl.dismiss({
      dismissed: true,
      confirmed
    });
  }

  /**
   * [onConfirm] - The click event for the submit button.
   */
  public onConfirm() {
    // Show that the user confirmed submitting the dialog.
    const confirmed = true;

    if (confirmed) {

      this.dismiss(confirmed);
    } else {
      this.dismiss(confirmed);
    }

  }

  

  /** PRIVATE METHODS */
  
  


  /** SELF INIT */

  ngOnInit() {
    this.initialized = false;

    
  }

  ngAfterViewInit(){
    //gather the grades of the selected user for the current year
    var currentYear = (new Date()).getFullYear()

  }

}
