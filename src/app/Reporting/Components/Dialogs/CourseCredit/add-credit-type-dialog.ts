import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonInput } from '@ionic/angular';

import { ReportingProvider as ReportingProvider } from '../../../Providers/reporting.service';
import * as ReportingModel from '../../../Providers/reporting.model';
import { HttpResponse } from '@angular/common/http';


// define component
@Component({
  selector: 'add-credit-type-dialog',
  templateUrl: 'add-credit-type-dialog.html',
  styleUrls: ['../../../reporting.page.scss']
})

export class AddCreditTypeDialog implements OnInit {

  // define service provider and route provider when component is constructed
  constructor(
    private modalCtrl: ModalController,
    public reportingProvider: ReportingProvider) {
  }

  public newCreditType: ReportingModel.ExternalCreditType = new ReportingModel.ExternalCreditType;

  /**
   * ASYNC: Close this modal, return "new data"* and [confirmed] flag to
   * flag to indicate that the user submitted the dialog, as opposed to cancelled it.
   *
   * "new data"* might not be returned if the user cancelled the action.
   */
  public async dismiss(confirmed) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    await this.modalCtrl.dismiss({
      dismissed: true,
      confirmed: confirmed
    });
  }

  /**
   * [onConfirm] - The click event for the submit button.
   */
  public onConfirm() {
    // Show that the user confirmed submitting the dialog.
    const confirmed = true;
    this.reportingProvider.addExternalCreditType(this.newCreditType).subscribe((result: HttpResponse<any>) => {

      this.reportingProvider.getExternalCreditTypes().subscribe((data: any) => {
        this.reportingProvider.serverInfo.ExternalCreditTypes = data;
        //dismiss the modal once complete
        this.dismiss(confirmed);
      });

    });

  }

  /** PRIVATE METHODS */

  



  /** SELF INIT */

  ngOnInit() {
    
  }

}
