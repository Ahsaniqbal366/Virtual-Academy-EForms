import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonInput } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import * as InventoryModel from '../../Providers/Model';
import { isNullOrUndefined } from 'is-what';

// define component
@Component({
  selector: 'edit-inventory-field-dialog',
  templateUrl: 'edit-inventory-field-dialog.html',
  styleUrls: ['../../page.scss']
})

export class EditInventoryFieldDialog implements OnInit {
 
  @Input() isEditMode: boolean;
  @Input() fieldToEdit: InventoryModel.InventoryItemFieldInfo;

  public fieldFormData = {
    FieldName: '',
    Value:''
  };

  // define service provider and route provider when component is constructed
  constructor(
    private modalCtrl: ModalController) {
  }

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
      confirmed,
      fieldData: this.fieldFormData
    });
  }

  /**
   * [onConfirm] - The click event for the submit button.
   */
  public onConfirm() {
    // Show that the user confirmed submitting the dialog.
    const confirmed = true;
    this.dismiss(confirmed);
  }

  /** PRIVATE METHODS */
  

 

  /** SELF INIT */

  ngOnInit() {

    if (!this.isEditMode) {
      
      setTimeout(() => {
        
      }, 0);
    }
  }
}
