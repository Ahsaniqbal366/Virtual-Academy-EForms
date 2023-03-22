import { Component, OnInit, Input, Injectable, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { CertificationTypeInfo, CertificationInfo } from '../../Providers/certification-management.model';
import { CertificationManagementService } from '../../Providers/certification-management.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { MaterialLoadingService } from 'src/app/shared/Material.Loading.Service';
import { Observable, Subject, of } from 'rxjs';
import { startWith, map, delay } from 'rxjs/operators';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';


// define component
@Component({
    selector: 'archive-certification.dialog',
    templateUrl: 'archive-certification.dialog.html',
    styleUrls: [
        '../../certification-management.page.scss'
    ]
})

export class CertificationManagement_ArchiveCertificationDialog_Component implements OnInit {

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private _materialLoadingService: MaterialLoadingService,
        public certificationManagementService: CertificationManagementService,
        private _dialog_Factory: CertificationManagement_ArchiveCertificationDialog_Factory,
        private _formBuilder: FormBuilder,
        private _formFieldValidate_errorMessagesService: FormFieldValidate_ErrorMessagesService,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
    }

    /**
     * PUBLIC  VARIABLES
     */
    // form variables (For new)
    public archiveCertificationForm = this._formBuilder.group({
        ReasonForArchive: ['', Validators.required],
    });

    /**
     * START: Data passed in thru [_dialogData].
     * Unpacked on _init.
     */

    // dialog input variables
    public certificationInfo: CertificationInfo;

    /** END: Data passed in thru [_dialogData] */

    public initialized: boolean;

    public formControl = new FormControl();

    /**
     * PRIVATE VARIABLES
     */

    /**
     * PUBLIC METHODS
     */

    /**
     * [getFieldErrorMessage] formats the error message to display on the input field
     */
    public getFieldErrorMessage(field: AbstractControl): string {
        return this._formFieldValidate_errorMessagesService.getFieldErrorMessage(field);
    }

    /**
     * [onSubmitBtnClick] is called when the submit button is clicked on the form.
     */
    public onSubmitBtnClick() {
        // verify that the form is valid
        if (this.archiveCertificationForm.valid) {
            // map the form data to a [CertificationInfo] object
            this._getFormInfo();

            // submit the form
            this._submitForm();
        } else {
            this._toastService.presentToast('Please correct any validation errors and try again.');
        }
    }

    public closeDialog(): void {
        this._dialog_Factory.closeDialog(false, null);
    }

    /**
     * PRIVATE METHODS
     */

    /**
     * [_submitForm] submits the [CertificationInfo] object to the DB
     */
    private _submitForm() {
        this._materialLoadingService.presentLoading("Submitting certification...");

            this.certificationManagementService.updateCertification(this.certificationInfo).subscribe((data: CertificationInfo) => {
                this._toastService.presentToast('Certification Archived');
                this._materialLoadingService.dismissLoading();
                this._dialog_Factory.closeDialog(true, data);
            },
                (error: APIResponseError) => {
                    console.error('certifications-error: ', error);
                    this.initialized = true;
                    this._materialLoadingService.dismissLoading();
                }
            );
    }

    /**
     * [_getFormInfo] maps the form data to the data object being updated
     */
    private _getFormInfo() {
        this.certificationInfo.ReasonForArchive = this.archiveCertificationForm.get("ReasonForArchive").value;
    }

    private _init() {
        // determine how the [CertificationInfo] object should be set up
        this.certificationInfo = this._dialogData.certificationInfo;
        this.initialized = true;
    }
    /**
     * SELF INIT
     */
    ngOnInit() {
        this._init();
    }
}



@Injectable()
export class CertificationManagement_ArchiveCertificationDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<CertificationManagement_ArchiveCertificationDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(certificationInfo: CertificationInfo)
        : MatDialogRef<CertificationManagement_ArchiveCertificationDialog_Component> {

        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(certificationInfo);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(certificationInfo);
        }

        return this._matDialogRef;
    }

    private _openDialog(certificationInfo: CertificationInfo) {
        this._matDialogRef = this.matDialog.open(CertificationManagement_ArchiveCertificationDialog_Component, {
            data: {
                certificationInfo: certificationInfo
            },
            maxWidth: '500px',
            autoFocus: false
        });
    }

    public closeDialog(confirmed: boolean, record: CertificationInfo): void {
        this._matDialogRef.close({
            dismissed: true,
            confirmed: confirmed,
            record: record
        });

        this._matDialogRef = null;
    }
}