import { Component, OnInit, Input, Injectable, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { PoliciesInfo } from '../../Providers/policies.model';
import { PoliciesManagementService } from '../../Providers/policies.service';
import { ToastService } from 'src/app/shared/Toast.Service';
import { MaterialLoadingService } from 'src/app/shared/Material.Loading.Service';
import { ModalController, AlertController, IonInput } from '@ionic/angular';
import { MessageCenterProvider } from 'src/app/MessageCenter/Providers/message-center.service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { PolicyConstant } from '../../model/policy.constant';


// define component
@Component({
    selector: 'policy-signature-reminder',
    templateUrl: 'policy-signature-reminder.dialog.html',
    styleUrls: [
        '../../policies.page.scss'
    ]
})

export class PolicyManagement_SendReminderDialog_Component implements OnInit {

    name: string;
    userId: string;
    policyId: number;
    policyName: string;

    public Editor = ClassicEditor;

    public messageSubject: FormControl;
    public messageText: FormControl;

    public isSignature: boolean;
    public isReminder: boolean;

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private messageCenterProvider: MessageCenterProvider,
        public policiesManagementService: PoliciesManagementService,
        public dialogRef: MatDialogRef<PolicyManagement_SendReminderDialog_Component>,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any,

    ) {
        this.messageSubject = new FormControl('');
        this.messageText = new FormControl('');
    }

    ngOnInit() {

        if (this._dialogData) {
            if ('assigneeName' in this._dialogData) {
                this.name = this._dialogData.assigneeName;
            }

            if ('userId' in this._dialogData) {
                this.userId = this._dialogData.userId;
            }

            if ('id' in this._dialogData) {
                this.policyId = this._dialogData.id;
            }
           
            if ('friendlyName' in this._dialogData) {
                this.policyName = this._dialogData.friendlyName;
            }

            this.messageSubject.setValue(PolicyConstant.Text.ReminderSubject + `${this.policyName} `);
            this.messageText.setValue(PolicyConstant.Text.ReminderBody);
        }
    }

    /**
     * [onConfirm] - The click event for the submit button.
     */
    public onConfirm() {
        this.messageCenterProvider.sendMessageCenterMessageToUser(
            this.userId,
            this.messageSubject.value,
            this.messageText.value
        ).subscribe({
            next: (res) => {
                this._toastService.presentToast(PolicyConstant.Text.Api.ReminderSentSuccess);
            },
            error: (err) => {
                this._toastService.presentToast(PolicyConstant.Text.Api.ServerErr);
            }
        });
        this.dismiss(true);
    }

    /**
      * ASYNC: Close this modal, return "new data"* and [confirmed] flag to
      * flag to indicate that the user submitted the dialog, as opposed to cancelled it.
      *
      * "new data"* might not be returned if the user cancelled the action.
      */
    public async dismiss(confirmed: boolean = false) {
        this.dialogRef.close();
    }

}



@Injectable()
export class PolicyManagement_SendReminderDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<PolicyManagement_SendReminderDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(policiesInfo: any)
        : MatDialogRef<PolicyManagement_SendReminderDialog_Component> {
        // this.isEdit = true;
        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(policiesInfo);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(policiesInfo);
        }

        return this._matDialogRef;
    }

    private _openDialog(policiesInfo: any) {
        this._matDialogRef = this.matDialog.open(PolicyManagement_SendReminderDialog_Component, {
            data: {
                ...policiesInfo
            },
            maxWidth: '900px',
            autoFocus: true
        });
    }

    public closeDialog(confirmed: boolean, record: PoliciesInfo): void {
        this._matDialogRef.close({
            dismissed: true,
            confirmed: confirmed,
            record: record
        });

        this._matDialogRef = null;
    }
}