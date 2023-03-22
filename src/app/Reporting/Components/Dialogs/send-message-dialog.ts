import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonInput } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from 'src/app/shared/Loading.Service';
import * as ReportingModel from '../../Providers/reporting.model';
import { isNullOrUndefined } from 'is-what';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';
import { MessageCenterProvider } from 'src/app/MessageCenter/Providers/message-center.service';
import { ToastService } from 'src/app/shared/Toast.Service';

// define component
@Component({
  selector: 'send-message-dialog',
  templateUrl: 'send-message-dialog.html',
  styleUrls: ['../../reporting.page.scss']
})

export class SendMessageDialog implements OnInit {

  @Input() LearnerName: string;
  @Input() LearnerUserName: string;
  @Input() SendToLearnerID: number;


  
  // define service provider and route provider when component is constructed
  constructor(
    private modalCtrl: ModalController,
    private messageCenterProvider: MessageCenterProvider,
    private _toastService: ToastService) {
  }

  public messageText:string;
  public messageSubject:string;

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

    if(confirmed){

      this.messageCenterProvider.sendMessageCenterMessageToUser(
        this.SendToLearnerID,
        this.messageSubject,
        this.messageText
        
    ).subscribe(
        (success: any) => {
            this._toastService.presentToast('Your message has been sent!');
        },
        (error) => {
            
        }
    );
      this.dismiss(confirmed);
    }else{
      this.dismiss(confirmed);
    }
    
  }

  /** PRIVATE METHODS */
  

 

  /** SELF INIT */

  ngOnInit() {

  
  }
}
