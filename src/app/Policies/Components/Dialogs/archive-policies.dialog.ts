import { Component, OnInit, Input, Injectable, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { PoliciesInfo } from '../../Providers/policies.model';
import { PoliciesManagementService } from '../../Providers/policies.service';
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
    selector: 'archive-policies.dialog',
    templateUrl: 'archive-policies.dialog.html',
    styleUrls: [
        '../../policies.page.scss'
    ]
})

export class PoliciesManagement_ArchivePoliciesDialog_Component implements OnInit {

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private _materialLoadingService: MaterialLoadingService,
        public policiesManagementService: PoliciesManagementService,
        private _dialog_Factory: Policies_ArchivePoliciesDialog_Factory,
        private _formBuilder: FormBuilder,
        private _formFieldValidate_errorMessagesService: FormFieldValidate_ErrorMessagesService,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
    }

    /**
     * PUBLIC  VARIABLES
     */
    // form variables (For new)
    public archivePoliciesForm = this._formBuilder.group({
        ReasonForArchive: ['', Validators.required],
    });

    /**
     * START: Data passed in thru [_dialogData].
     * Unpacked on _init.
     */

    // dialog input variables
    public policiesInfo: PoliciesInfo;

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
            // map the form data to a [PoliciesInfo] object
            this._getFormInfo();

            // submit the form
            this._submitForm();
    }

    public closeDialog(): void {
        this._dialog_Factory.closeDialog(false, null);
    }

    /**
     * PRIVATE METHODS
     */

    /**
     * [_submitForm] submits the [PoliciesInfo] object to the DB
     */
    private _submitForm() {
        this._materialLoadingService.presentLoading("Submitting policy...");
            this.policiesManagementService.deletePolicy(this.policiesInfo.policyId).subscribe((data: PoliciesInfo) => {
                this._toastService.presentToast('Policy Archived');
                this._materialLoadingService.dismissLoading();
                this._dialog_Factory.closeDialog(true, data);
            },
                (error: APIResponseError) => {
                    console.error('policies-error: ', error);
                    this.initialized = true;
                    this._materialLoadingService.dismissLoading();
                }
            );
    }

    /**
     * [_getFormInfo] maps the form data to the data object being updated
     */
    private _getFormInfo() {
        // this.policiesInfo.ReasonForArchive = this.archivePoliciesForm.get("ReasonForArchive").value;
    }

    private _init() {
        // determine how the [PoliciesInfo] object should be set up
        this.policiesInfo = this._dialogData.policiesInfo;
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
export class Policies_ArchivePoliciesDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<PoliciesManagement_ArchivePoliciesDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(policiesInfo: PoliciesInfo)
        : MatDialogRef<PoliciesManagement_ArchivePoliciesDialog_Component> {

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

    private _openDialog(policiesInfo: PoliciesInfo) {
        this._matDialogRef = this.matDialog.open(PoliciesManagement_ArchivePoliciesDialog_Component, {
            data: {
                policiesInfo: policiesInfo
            },
            maxWidth: '500px',
            autoFocus: false
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