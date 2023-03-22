import { Component, OnInit, Input, Injectable, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
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
    selector: 'add-new-certification-dialog',
    templateUrl: 'add-new-certification.dialog.html',
    styleUrls: [
        '../../certification-management.page.scss'
    ]
})

export class CertificationManagement_AddCertificationDialog_Component implements OnInit {

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private _materialLoadingService: MaterialLoadingService,
        public certificationManagementService: CertificationManagementService,
        private _dorFormSummaryDialog_Factory: CertificationManagement_AddCertificationDialog_Factory,
        private _formBuilder: UntypedFormBuilder,
        private _formFieldValidate_errorMessagesService: FormFieldValidate_ErrorMessagesService,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
    }

    /**
     * PUBLIC  VARIABLES
     */
    // form variables (For new)
    public addCertificationForm = this._formBuilder.group({
        User: ['', []],
        Title: ['', [Validators.required]],
        Type: ['', []],
        TrainingHours: ['', [Validators.required]],
        CompletionDate: ['', Validators.required],
        ExpirationDate: ['', []],
        AlertDate: [''],
        AddToTrainingRecords: ['']

    });

    /**
     * START: Data passed in thru [_dialogData].
     * Unpacked on _init.
     */

    // dialog input variables
    public certificationInfo: CertificationInfo;
    public certificationTypes: CertificationTypeInfo[];

    // dialog input variable to control edit/add control
    public isNewCertification: boolean;


    /** END: Data passed in thru [_dialogData] */

    public initialized: boolean;

    public fieldDOBMaxValue: Date = new Date();

    public headerText: string;
    public submitBtnText: string;
    public submitMessage: string;

    public fileUploadInput: FileUploadComponentInput;

    public formControl = new FormControl();
    public filteredUserOptions: Observable<UserInfo[]>;
    public selectedUser: UserInfo;

    public users$: Observable<any[]>;
    public agenciesLoading = false;
    public agenciesInput$ = new Subject<string>();
    public formattedAgencyNameLabel: string;

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
        if (this.addCertificationForm.valid) {
            // map the form data to a [CertificationInfo] object
            this._getFormInfo();

            // submit the form
            this._submitForm();
        } else {
            this._toastService.presentToast('Please correct any validation errors and try again.');
        }
    }

    public closeDialog(): void {
        this._dorFormSummaryDialog_Factory.closeDialog(false, null);
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

    public getUsers(term: string = null): Observable<UserInfo[]> {
        let items = this.certificationManagementService.serverInfo.users;
        if (term) {
            items = items.filter(x => x.FullName.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }

    /**
     * PRIVATE METHODS
     */

    /**
     * [_submitForm] submits the [CertificationInfo] object to the DB
     */
    private _submitForm() {
        this._materialLoadingService.presentLoading("Submitting certification...");

        if (this.isNewCertification) {
            this.certificationManagementService.updateCertification(this.certificationInfo).subscribe((data: CertificationInfo) => {
                this._toastService.presentToast(this.submitMessage);
                this._materialLoadingService.dismissLoading();
                this._dorFormSummaryDialog_Factory.closeDialog(true, data);
            },
                (error: APIResponseError) => {
                    console.error('certifications-error: ', error);
                    this.initialized = true;
                    this._materialLoadingService.dismissLoading();
                }
            );
        } else {
            this.certificationManagementService.renewCertification(this.certificationInfo).subscribe((data: CertificationInfo) => {
                this._toastService.presentToast(this.submitMessage);
                this._materialLoadingService.dismissLoading();
                this._dorFormSummaryDialog_Factory.closeDialog(true, data);
            },
                (error: APIResponseError) => {
                    console.error('certifications-error: ', error);
                    this.initialized = true;
                    this._materialLoadingService.dismissLoading();
                }
            );
        }
    }

    /**
     * [_setupRenewMode] maps the incoming data object to the corresponding form controls
     * when the form is in 'Renew' mode
     */
    private _setupRenewMode() {
        // set form properties, altering the form to have some disabled fields
        this.addCertificationForm = this._formBuilder.group({
            User: [this.certificationInfo.UserID, []],
            Title: [this.certificationInfo.Title, [Validators.required]],
            Type: [this.certificationInfo.TypeID, []],
            TrainingHours: ['', [Validators.required]],
            CompletionDate: ['', Validators.required],
            ExpirationDate: ['', []],
            AlertDate: [''],
            AddToTrainingRecords: ['']

        });

        this.certificationInfo.Cloudpath = '';

        // set form properties
        this.headerText = "Renew Certification";
        this.submitMessage = "Certification Renewed Successfully";
    }

    /**
     * [_setupEditMode] maps the incoming data object to the corresponding form controls
     * when the form is in 'Add' mode
     */
    private _setupAddMode() {
        // set form properties
        this.headerText = "Add New Certification";
        this.submitMessage = "Certification Added Successfully";
    }

    /**
     * [_getFormInfo] maps the form data to the data object being updated
     */
    private _getFormInfo() {
        this.certificationInfo.UserID = +this.addCertificationForm.get("User").value ? +this.addCertificationForm.get("User").value : +this.certificationInfo.UserID;
        this.certificationInfo.Title = this.addCertificationForm.get("Title").value;
        this.certificationInfo.TypeID = +this.addCertificationForm.get("Type").value ? +this.addCertificationForm.get("Type").value : +this._getUncategorizedCertificationType();
        this.certificationInfo.TrainingHours = +this.addCertificationForm.get("TrainingHours").value;
        this.certificationInfo.CompletionDate = this.addCertificationForm.get("CompletionDate").value;
        this.certificationInfo.ExpirationDate = this.addCertificationForm.get("ExpirationDate").value;
        this.certificationInfo.IsTrainingRecord = this.addCertificationForm.get("AddToTrainingRecords").value;
        this.certificationInfo.AlertDate = this.addCertificationForm.get("AlertDate").value;
        //this.certificationInfo.Cloudpath = "";
    }

    /**
     * [_getUncategorizedCertificationType] returns the 'Uncategorized' type category
     * for an entry submission when no [CertificationType] is selected
     */
    private _getUncategorizedCertificationType(){
        return this.certificationTypes.filter(t => t.Name == "Uncategorized")[0].CertificationTypeID;
    }

    private _init() {
        this.users$ = this.getUsers();

        // map the list of available certificate types to the local variable
        this.certificationTypes = this.certificationManagementService.certificationTypes;
        // map the mode being used to the local variable
        this.isNewCertification = this._dialogData.isNewCertification;

        // determine how the [CertificationInfo] object should be set up
        this.certificationInfo = this.isNewCertification ? new CertificationInfo() : this._dialogData.certificationInfo;

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

        // if the dialog mode is set up to be in edit mode, set up the form as such
        if (!this.isNewCertification) {
            this._setupRenewMode();
        } else {
            this._setupAddMode();
        }

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
export class CertificationManagement_AddCertificationDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<CertificationManagement_AddCertificationDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(certificationInfo: CertificationInfo, isNewCertification: boolean)
        : MatDialogRef<CertificationManagement_AddCertificationDialog_Component> {

        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(certificationInfo, isNewCertification);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(certificationInfo, isNewCertification);
        }

        return this._matDialogRef;
    }

    private _openDialog(certificationInfo: CertificationInfo, isNewCertification: boolean) {
        this._matDialogRef = this.matDialog.open(CertificationManagement_AddCertificationDialog_Component, {
            data: {
                isNewCertification: isNewCertification,
                certificationInfo: certificationInfo
            },
            maxWidth: '550px',
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