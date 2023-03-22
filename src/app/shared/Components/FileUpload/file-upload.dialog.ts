import { Component, OnInit, Injectable, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicLoadingService } from '../../Ionic.Loading.Service';
import { FileUploadComponent, FileUploadComponentInput } from './file-upload.component';

@Component({
    selector: 'sls-file-upload-dialog',
    templateUrl: './file-upload.dialog.html',
    styleUrls: []
})

export class FileUploadDialog implements OnInit {
    constructor(
        private _modalController: ModalController,
        private _loadingService: IonicLoadingService
    ) { }

    /*******************************************
     * PUBLIC VARIABLES
     *******************************************/
    @Input() dialogInput: FileUploadDialogInput;

    @ViewChild(FileUploadComponent) _fileUploadComponent: FileUploadComponent;

    /*******************************************
     * PRIVATE VARIABLES
     *******************************************/

    /*******************************************
    * PUBLIC METHODS
    *******************************************/

    public closeDialog() {
        // using the injected ModalController this page
        // can "dismiss" itself and optionally pass back data
        this._dismiss(null, false);
    }

    public submitDialog() {
        this._loadingService.presentLoading('Uploading, please wait...');

        this._fileUploadComponent.uploadFile().subscribe(
            // upload success
            (uploadedFileURL: string) => {
                this._loadingService.dismissLoading();

                const confirmed = true;
                this._dismiss(uploadedFileURL, confirmed);
            },
            // upload fail
            (error) => {
                console.error('trainingPrograms-error: ', error);
                this._loadingService.dismissLoading();
            }
        );
    }

    /*******************************************
    * PRIVATE METHODS
    *******************************************/
    public _dismiss(uploadedFileURL, confirmed) {
        this._modalController.dismiss({
            dismissed: true,
            uploadedFileURL: uploadedFileURL,
            confirmed
        });
    }

    /*******************************************
     * SELF INIT
     *******************************************/

    ngOnInit() {
    }
}

export class FileUploadDialogInput {
    public HeaderText: string;
    public FileUploadComponentInput: FileUploadComponentInput;
}

@Injectable()
export class FileUploadDialogFactory {
    constructor(
        public modalController: ModalController) {
    }

    public async openDialog(dialogInput: FileUploadDialogInput): Promise<object> {
        const modal = await this.modalController.create({
            backdropDismiss: false, // Don't let user accidentally click outside to close.
            component: FileUploadDialog,
            componentProps: {
                dialogInput: dialogInput
            }
        });

        await modal.present();

        return modal.onDidDismiss();

    }
}