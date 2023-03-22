import { Component, OnInit, Input } from '@angular/core';
import { MessageCenterProvider } from '../../Providers/message-center.service';
import { MessageCenterTab, MessageInfo } from '../../Providers/message-center.model';
import { AlertController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { event } from 'jquery';
import { ToastService } from 'src/app/shared/Toast.Service';
import { SignatureEditor } from 'src/app/MessageCenter/Components/SignatureEditor/signature-editor';

@Component({
  selector: 'sls-message-center-master-action',
  templateUrl: './sls-message-center-master-action.html',
})
export class MessageCenterMasterActionComponent implements OnInit {

  constructor(
    public messageCenterProvider: MessageCenterProvider,
    private alertController: AlertController,
    public router: Router,
    public navController: NavController,
    private toastService: ToastService,
    public popoverController: PopoverController,
    public modalController: ModalController
  ) { }


  public onMasterActionChange($event: Event) {
    if (this.messageCenterProvider.masterActions.selectedAction !== '') {
      this.messageCenterProvider.onMasterActionGoClick($event, this.messageCenterProvider.masterActions.selectedAction);
    }
  }

  public async presentSignatureEditor() {
    const modal = await this.modalController.create({
      backdropDismiss: false,
      component: SignatureEditor,
      componentProps: {

      },
      cssClass: 'small-modal',
    });

    return await modal.present();
  }

  private _Init() {

  }

  ngOnInit() {
    this._Init();
  }
}
