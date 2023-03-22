import { Component, OnInit, Input, Injectable, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { CreditTypeInfo, ExternalCreditCourseInfo } from '../../Providers/external-training.model';
import { ExternalTrainingService } from '../../Providers/external-training.service';
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
    selector: 'archive-external-training.dialog',
    templateUrl: 'archive-external-training.dialog.html',
    styleUrls: [
        '../../external-training.page.scss'
    ]
})

export class ExternalTraining_ArchiveExternalTrainingDialog_Component implements OnInit {

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private _materialLoadingService: MaterialLoadingService,
        public externalTrainingService: ExternalTrainingService,
        private _dialog_Factory: ExternalTraining_ArchiveExternalTrainingDialog_Factory,
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
    public externalTrainingInfo: ExternalCreditCourseInfo;

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
            // map the form data to a [externalTrainingInfo] object
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
     * [_submitForm] submits the [externalTrainingInfo] object to the DB
     */
    private _submitForm() {
        this._materialLoadingService.presentLoading("Submitting externalTraining...");

            this.externalTrainingService.updateExternalTrainingCourse(this.externalTrainingInfo).subscribe((data: ExternalCreditCourseInfo) => {
                this._toastService.presentToast('ExternalTraining Archived');
                this._materialLoadingService.dismissLoading();
                this._dialog_Factory.closeDialog(true, data);
            },
                (error: APIResponseError) => {
                    console.error('externaltraining-error: ', error);
                    this.initialized = true;
                    this._materialLoadingService.dismissLoading();
                }
            );
    }

    /**
     * [_getFormInfo] maps the form data to the data object being updated
     */
    private _getFormInfo() {
        
    }

    private _init() {
        // determine how the [externalTrainingInfo] object should be set up
        this.externalTrainingInfo = this._dialogData.externalTrainingInfo;
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
export class ExternalTraining_ArchiveExternalTrainingDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<ExternalTraining_ArchiveExternalTrainingDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(externalTrainingInfo: ExternalCreditCourseInfo)
        : MatDialogRef<ExternalTraining_ArchiveExternalTrainingDialog_Component> {

        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(externalTrainingInfo);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(externalTrainingInfo);
        }

        return this._matDialogRef;
    }

    private _openDialog(externalTrainingInfo: ExternalCreditCourseInfo) {
        this._matDialogRef = this.matDialog.open(ExternalTraining_ArchiveExternalTrainingDialog_Component, {
            data: {
                externalTrainingInfo: externalTrainingInfo
            },
            maxWidth: '500px',
            autoFocus: false
        });
    }

    public closeDialog(confirmed: boolean, record: ExternalCreditCourseInfo): void {
        this._matDialogRef.close({
            dismissed: true,
            confirmed: confirmed,
            record: record
        });

        this._matDialogRef = null;
    }
}