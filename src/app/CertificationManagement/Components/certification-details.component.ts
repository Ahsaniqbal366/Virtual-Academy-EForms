import { Component, OnInit, Input, Injectable, Inject, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { CertificationTypeInfo, CertificationInfo } from '../Providers/certification-management.model';
import { CertificationManagementService } from '../Providers/certification-management.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { AlertController } from '@ionic/angular';
import { CertificationManagement_ArchiveCertificationDialog_Factory } from './Dialogs/archive-certification.dialog';
import { CertificationManagement_AuditLogDialog_Factory } from './AuditLog/Dialog/certification-audit-log.dialog';

@Component({
    selector: 'certification-details',
    templateUrl: 'certification-details.component.html',
    styleUrls: [
        '../certification-management.page.scss'

    ]
})

export class CertificationDetails_Component implements OnInit {
    constructor(
        public certificationManagementService: CertificationManagementService,
        private _loadingService: IonicLoadingService,
        private _archiveNewCertificationFactory: CertificationManagement_ArchiveCertificationDialog_Factory,
        private _auditLogDialogFactory: CertificationManagement_AuditLogDialog_Factory,
        private _toastService: ToastService,
        private _alertController: AlertController) {
    }


    public certificationsDataSource: any;
    public initialized: boolean;

    public fileUploadInput: FileUploadComponentInput;

    @Input() certificationInfo: CertificationInfo;

    // when a certification is updated
    @Output() onCertificationUpdated: EventEmitter<CertificationInfo> = new EventEmitter();
    // when a certification is archived
    @Output() onCertificationArchived: EventEmitter<CertificationInfo> = new EventEmitter();


    /**
     * [onExpirationDateChanged] triggers when the expiration date is changed, to reset the IsExpired flag, if needed.
     */
    public onExpirationDateChanged(certification: CertificationInfo) {
        console.log('onExpirationDateChanged...');
        certification.IsExpired = certification.ExpirationDate < new Date();
    }

    /**
     * [onCertificationUploaded] triggers when a certification file is uploaded
     */
    public onCertificationUploaded(fileUploadPath: string) {
        // set the upload path to the uploaded file path
        this.certificationInfo.Cloudpath = fileUploadPath;
    }

    /**
     * [onClearCertificationUploadBtn] clears the currently stored cloudpath for the certification upload
     */
    public onClearCertificationUploadBtn() {
        // clear the upload path for the certification
        this.certificationInfo.Cloudpath = "";
    }

    public onViewCertificationUploadBtn(certificationInfo: CertificationInfo) {
        this._viewCertificationFile(certificationInfo);
    }

    /**
     * [onSaveBtnClick] handles the event of the 'Save' button being clicked in the edit view
     */
    public onSaveBtnClick() {
        this._updateCertificationInfo(this.onCertificationUpdated);
    }


    /**
     * [onArchiveBtnClick] handles the event of the 'Archive' button being clicked in the edit view
     */
    public onArchiveBtnClick() {
        this._archiveNewCertificationFactory.openDialog(this.certificationInfo).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                // mark the certification as "Archived"
                this.certificationInfo.IsDeleted = true;
                this.certificationInfo.ReasonForArchive = result.record.ReasonForArchive;
                // update the certification
                this._updateCertificationInfo(this.onCertificationArchived);
            }
        });
    }
    
    /**
     * [onUnArchiveBtnClick] handles the event of the 'Archive' button being clicked in the edit view
     */
    public onUnarchiveBtnClick() {
        // display a confirmation alert
        this._alertController.create({
            header: 'Unarchive Certification',
            message: 'Are you sure you want to unarchive this certification?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        // mark the certification as "Archived"
                        this.certificationInfo.IsDeleted = false;
                        // update the certification
                        this._updateCertificationInfo(this.onCertificationArchived);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    public onViewAuditLogBtnClick(){
        this._presentAuditLogDialog();
    }

    /**
     * [_updateCertificationInfo] issues the [updateCertification] API call then emits the
     * passed in event to the parent component
     */
    private _updateCertificationInfo(eventToEmit: EventEmitter<CertificationInfo>) {
        this._loadingService.presentLoading("Saving certification...");

        this.certificationManagementService.updateCertification(this.certificationInfo).subscribe((data: CertificationInfo) => {
            this._toastService.presentToast("Certification Updated");
            this._loadingService.dismissLoading();

            eventToEmit.emit(data);
        },
            (error: APIResponseError) => {
                console.log('certifications-error: ', error);
                this.initialized = true;
                this._loadingService.dismissLoading();
            }
        );
    }

    /**
     * [_viewCertificationFile] opens the given certification's cloudpath
     * if one exists
     */
    private _viewCertificationFile(certificationInfo: CertificationInfo) {
        // if there is a cloudpath, open a new tab for the link
        if (certificationInfo.Cloudpath) {
            window.open(certificationInfo.Cloudpath, '_blank');
        } else {
            this._alertController.create({
                message: "This certification does not have an uploaded file.",
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

    private _presentAuditLogDialog(){
        this._auditLogDialogFactory.openDialog(this.certificationInfo).afterClosed().subscribe(result => {
            
        });
    }

    private _init() {

        // initialize the file upload input for the file
        this.fileUploadInput = {
            SelectedTab: "File",
            AvailableTabs: ["File"],
            FileUploadConfig: {
                autoSubmit: true,
                maxFileSize_MB: 50,
                apiRoot: API_URLS.Core,
                apiCallMethod: 'certifications/uploadCertification',
                validFileTypes: ['png', 'jpg','jpeg', 'pdf'],
                additionalParameters: {

                }
            },
            showInstructions: false,
            useCustomTitle: true,
            customTitleText: 'Certification',
            showFileUploadedCard: true,
            preExistingFileUpload: this.certificationInfo.Cloudpath
        };
        this.initialized = true;
    }


    ngOnInit() {
        this._init();
    }
}