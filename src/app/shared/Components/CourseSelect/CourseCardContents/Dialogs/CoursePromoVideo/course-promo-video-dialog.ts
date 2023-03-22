import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController} from '@ionic/angular';


// define component
@Component({
  selector: 'course-promo-video-dialog',
  templateUrl: 'course-promo-video-dialog.html',
 // styleUrls: ['../../../courseselect.module.scss']
})

export class CoursePromoVideoDialog implements OnInit {

  @Input() event: any;
  @Input() course: any;


  
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
  public async dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    await this.modalCtrl.dismiss({
      dismissed: true
    });
  }

  

  /** PRIVATE METHODS */
  

 

  /** SELF INIT */

  ngOnInit() {
  }
}
