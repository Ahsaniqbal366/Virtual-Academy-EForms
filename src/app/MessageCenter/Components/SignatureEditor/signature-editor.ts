import { Component, Input, OnInit} from '@angular/core';
import { ModalController} from '@ionic/angular';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MessageCenterProvider } from '../../Providers/message-center.service';
import { MessageInfo } from '../../Providers/message-center.model';

@Component({
  selector: 'signature-editor',
  templateUrl: 'signature-editor.html',
  styleUrls: ['signature-editor.scss']
})
export class SignatureEditor implements OnInit {
  
  constructor(
    public messageCenterProvider: MessageCenterProvider,
    public modalController: ModalController
  ){}

  public signatureToEdit: any;
  public prevSignature: any;
  public disableButtons: boolean;

  // CK Editor
  public ckeditorInstance = ClassicEditor;
  public ckeditorConfig = {
    placeholder: 'Add signature here...',
    link: { addTargetToExternalLinks: true },
  };
  
  public async dismiss(confirmed) {
    this.signatureToEdit = this.messageCenterProvider.signatureInfo;
    await this.modalController.dismiss({
      dismissed: true,
      confirmed
    });
  }

  public autoFill() {
    this.signatureToEdit = this.messageCenterProvider.userInfo.FirstName + ' ' + this.messageCenterProvider.userInfo.LastName + '<br/>' + this.messageCenterProvider.userInfo.Email;
  }

  public onConfirm() {
    const confirmed = true;
    this.disableButtons = true;
    this.messageCenterProvider.isLoading = true;
    this.messageCenterProvider.signatureInfo = this.signatureToEdit;
    this.messageCenterProvider.updateSignature(this.signatureToEdit).subscribe((success: any) => {
      this.messageCenterProvider.isLoading = false;
      this.disableButtons = false;
      this.messageCenterProvider.messageToBeSent.Message = this.messageCenterProvider.messageToBeSent.Message.replace(this.prevSignature, this.signatureToEdit);
      this.dismiss(confirmed);
    },(error) =>{
      console.log('error: ', error);
      this.messageCenterProvider.isLoading = false;
      this.disableButtons = false;
      this.dismiss(confirmed);
    });
  }


  ngOnInit() {
    if(!this.messageCenterProvider.signatureInfo){
      this.signatureToEdit = '';
    }else{
      this.signatureToEdit = this.messageCenterProvider.signatureInfo;
    }
    this.disableButtons = false;
    this.prevSignature = this.signatureToEdit;
  }

}