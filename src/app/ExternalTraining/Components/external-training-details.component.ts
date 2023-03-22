import { Component, OnInit, Input, Injectable, Inject, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { CreditTypeInfo, ExternalCreditCourseInfo } from '../Providers/external-training.model';
import { ExternalTrainingService } from '../Providers/external-training.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { AlertController } from '@ionic/angular';
import { ExternalTraining_ArchiveExternalTrainingDialog_Factory } from './Dialogs/archive-external-training.dialog';

@Component({
    selector: 'external-training-details',
    templateUrl: 'external-training-details.component.html',
    styleUrls: [
        '../external-training.page.scss'

    ]
})

export class ExternalTrainingDetails_Component implements OnInit {
    constructor(
        public externalTrainingService: ExternalTrainingService,
        private _loadingService: IonicLoadingService,
        private _archiveExternalTrainingFactory: ExternalTraining_ArchiveExternalTrainingDialog_Factory,
        private _toastService: ToastService,
        private _alertController: AlertController) {
    }


    public externalTrainingDataSource: any;
    public initialized: boolean;

    public fileUploadInput: FileUploadComponentInput;

    @Input() externalTrainingInfo: ExternalCreditCourseInfo;

    // when a externalTraining is updated
    @Output() onExternalTrainingUpdated: EventEmitter<ExternalCreditCourseInfo> = new EventEmitter();
    // when a externalTraining is archived
    @Output() onExternalTrainingArchived: EventEmitter<ExternalCreditCourseInfo> = new EventEmitter();

    /**
     * [onExternalTrainingUploaded] triggers when a externalTraining file is uploaded
     */
    public onExternalTrainingUploaded(fileUploadPath: string) {
        // set the upload path to the uploaded file path
        this.externalTrainingInfo.AdditionalDetailsUploadPath = fileUploadPath;
    }

    /**
     * [onClearExternalTrainingUploadBtn] clears the currently stored cloudpath for the externalTraining upload
     */
    public onClearExternalTrainingUploadBtn() {
        // clear the upload path for the externalTraining
        this.externalTrainingInfo.AdditionalDetailsUploadPath = "";
    }

    public onViewCertificationUploadBtn(externalTrainingInfo: ExternalCreditCourseInfo) {
        this._viewCertificationFile(externalTrainingInfo);
    }

    /**
     * [onSaveBtnClick] handles the event of the 'Save' button being clicked in the edit view
     */
    public onSaveBtnClick() {
        this._updateExternalTrainingInfo(this.onExternalTrainingUpdated);
    }


    /**
     * [onArchiveBtnClick] handles the event of the 'Archive' button being clicked in the edit view
     */
    public onArchiveBtnClick() {
        this._alertController.create({
            header: 'Archive Course',
            message: 'Are you sure you want to archive this course?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        // mark the externalTraining as "Archived"
                        this.externalTrainingInfo.IsDeleted = true;
                
                        // update the externalTraining
                        this._updateExternalTrainingInfo(this.onExternalTrainingArchived);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }
    /**
     * [onArchiveBtnClick] handles the event of the 'Archive' button being clicked in the edit view
     */
    public onUnarchiveBtnClick() {
        this._alertController.create({
            header: 'Unarchive Course',
            message: 'Are you sure you want to unarchive this course?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        // mark the externalTraining as "Archived"
                        this.externalTrainingInfo.IsDeleted = false;
                
                        // update the externalTraining
                        this._updateExternalTrainingInfo(this.onExternalTrainingArchived);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    /**
     * [_updateExternalTrainingInfo] issues the [updateExternalTrainingCourse] API call then emits the
     * passed in event to the parent component
     */
    private _updateExternalTrainingInfo(eventToEmit: EventEmitter<ExternalCreditCourseInfo>) {
        this._loadingService.presentLoading("Saving external training...");

        this.externalTrainingService.updateExternalTrainingCourse(this.externalTrainingInfo).subscribe((data: ExternalCreditCourseInfo) => {
            this._toastService.presentToast("ExternalTraining Updated");
            this._loadingService.dismissLoading();

            eventToEmit.emit(data);
        },
            (error: APIResponseError) => {
                console.log('externaltraining-error: ', error);
                this.initialized = true;
                this._loadingService.dismissLoading();
            }
        );
    }

    /**
     * [_viewCertificationFile] opens the given externalTraining's cloudpath
     * if one exists
     */
    private _viewCertificationFile(externalTrainingInfo: ExternalCreditCourseInfo) {
        // if there is a cloudpath, open a new tab for the link
        if (externalTrainingInfo.AdditionalDetailsUploadPath) {
            window.open(externalTrainingInfo.AdditionalDetailsUploadPath, '_blank');
        } else {
            this._alertController.create({
                message: "This externalTraining does not have an uploaded file.",
                buttons: [
                    {
                        text: 'OK',
                        role: 'ok'
                    }
                ]
            }).then(alertElement => {

                alertElement.present();
            });
        }
    }

    private _init() {

        // initialize the file upload input for the DOR S.E.G. file
        this.fileUploadInput = {
            SelectedTab: "File",
            AvailableTabs: ["File"],
            FileUploadConfig: {
                autoSubmit: true,
                maxFileSize_MB: 50,
                apiRoot: API_URLS.Core,
                apiCallMethod: 'externaltraining/uploadCourseDescription',
                validFileTypes: ['png', 'jpg', 'pdf'],
                additionalParameters: {

                }
            },
            showInstructions: false,
            useCustomTitle: true,
            customTitleText: 'Additional Info',
            showFileUploadedCard: true,
            preExistingFileUpload: this.externalTrainingInfo.AdditionalDetailsUploadPath
        };
        this.initialized = true;
    }


    ngOnInit() {
        this._init();
    }
}