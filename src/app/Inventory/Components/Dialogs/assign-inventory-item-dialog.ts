import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonInput } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import * as InventoryModel from '../../Providers/Model';
import { isNullOrUndefined } from 'is-what';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';

// define component
@Component({
  selector: 'assign-inventory-item-dialog',
  templateUrl: 'assign-inventory-item-dialog.html',
  styleUrls: ['../../page.scss']
})

export class AssignInventoryItemDialog implements OnInit {

  @Input() itemToEdit: InventoryModel.InventoryItemFieldInfo;

  public selectedUsers: UserInfo[];
  
  // define service provider and route provider when component is constructed
  constructor(
    private modalCtrl: ModalController) {
  }

  public setUserSelection($event): void {
    this.selectedUsers = $event;
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
      confirmed
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

  
  }
}
