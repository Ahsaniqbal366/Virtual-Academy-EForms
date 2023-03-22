import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/shared/Toast.Service';

@Component({
  selector: 'app-profile-message-user-dialog',
  templateUrl: './MessageUserDialog.component.html',
  styleUrls: ['./MessageUserDialog.component.scss'],
})
export class MessageUserDialogComponent implements OnInit {
  public message: {
    recipientID: number,
    recipientName: string,
    subject: string,
    doSend: boolean,
    body: string
  };

  constructor(public dialogRef: MatDialogRef<MessageUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private alertController: AlertController,
    private toastService: ToastService) { }


  // CK Editor
  public ckeditorInstance = ClassicEditor;
  public ckeditorConfig = {
    placeholder: 'Add content here...',
    toolbar:
      [
        'bold', 'italic',
        '|',
        'link'
      ]
  };

  public initialized = false;

  /**Send message,
   * If there is no subject, ask the user if they want to send.
   * Only send the message if there is in fact a message body.
   */
  public sendMessage() {
    // COMING SOON!
    // JDB 12/2/2016 - Refactored this to use $mdDialog and udpated message center interface.
    // check to see if there is message subject.
    //if (this.message.subject.length <= 0) {
    // JDB 11/14/2016 - Replaced $mdDialog.confirm() here with a jConfirm to avoid z-indexing issues and
    // to prevent the possibility of multiple $mdDialog instances from attempting to open at once.
    //   this.alertController.create({
    //     header: 'Message Subject',
    //     message: 'You did not enter a subject. Do you want to send this message anyway?',
    //     buttons: [
    //       {
    //         text: 'No',
    //         role: 'cancel',
    //         cssClass: 'secondary',
    //         handler: (blah) => {
    //           console.log('Confirm Canceled');
    //         }
    //       }, {
    //         text: 'Yes',
    //         handler: () => {
    //           this.message.doSend = true;
    //           // $mdDialog.hide(this.message);
    //           this.closeDialog();
    //         }
    //       }
    //     ]
    //   }).then(alertElement => {
    //     alertElement.present();
    //   });
    // } else {
    this.message.doSend = true;
    this.closeDialog();
    //}
  }

  ngOnInit() {
    // Set the recipientID and recipientName
    this.message = {
      recipientID: this.data.profile.UserID,
      recipientName: this.data.profile.Name,
      subject: '',
      doSend: false,
      body: ''
    };

    this.initialized = true;
  }

  // Called on cancel click
  closeDialog(): void {
    // User accepted and wants to send.
    // Make sure the controller said we can send the message.
    if (this.message.doSend) {
      // If so, invoke this.sendMessage on the parameter.
      this.data.profilesProvider.sendMessage(this.message.recipientID, this.message.subject, this.message.body).subscribe(
        (response: any) => {
          const toast = 'Message sent';
          this.toastService.presentToast(toast);
        });
    }

    this.dialogRef.close();
  }

}
