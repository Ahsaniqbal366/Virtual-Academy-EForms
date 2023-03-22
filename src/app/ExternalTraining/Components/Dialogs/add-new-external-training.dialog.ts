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
    selector: 'add-new-external-training-dialog',
    templateUrl: 'add-new-external-training.dialog.html',
    styleUrls: [
        '../../external-training.page.scss'
    ]
})

export class ExternalTraining_AddExternalTrainingDialog_Component implements OnInit {

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private _materialLoadingService: MaterialLoadingService,
        public externalTrainingService: ExternalTrainingService,
        private _dorFormSummaryDialog_Factory: ExternalTraining_AddExternalTrainingDialog_Factory,
        private _formBuilder: FormBuilder,
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
        Type: ['', [Validators.required]],
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
    public externalTrainingInfo: ExternalCreditCourseInfo;
    public externalTrainingTypes: CreditTypeInfo[];

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
            // map the form data to a [externalTrainingInfo] object
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

    public getUsers(term: string = null): Observable<UserInfo[]> {
        let items = this.externalTrainingService.serverInfo.users;
        if (term) {
            items = items.filter(x => x.FullName.toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
        }
        return of(items).pipe(delay(500));
    }

    /**
     * PRIVATE METHODS
     */

    /**
     * [_submitForm] submits the [externalTrainingInfo] object to the DB
     */
    private _submitForm() {
        this._materialLoadingService.presentLoading("Submitting externalTraining...");

        if (this.isNewCertification) {
            this.externalTrainingService.updateExternalTrainingCourse(this.externalTrainingInfo).subscribe((data: ExternalCreditCourseInfo) => {
                this._toastService.presentToast(this.submitMessage);
                this._materialLoadingService.dismissLoading();
                this._dorFormSummaryDialog_Factory.closeDialog(true, data);
            },
                (error: APIResponseError) => {
                    console.error('externaltraining-error: ', error);
                    this.initialized = true;
                    this._materialLoadingService.dismissLoading();
                }
            );
        } else {
            this.externalTrainingService.renewCertification(this.externalTrainingInfo).subscribe((data: ExternalCreditCourseInfo) => {
                this._toastService.presentToast(this.submitMessage);
                this._materialLoadingService.dismissLoading();
                this._dorFormSummaryDialog_Factory.closeDialog(true, data);
            },
                (error: APIResponseError) => {
                    console.error('externaltraining-error: ', error);
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
        
    }

    /**
     * [_setupEditMode] maps the incoming data object to the corresponding form controls
     * when the form is in 'Add' mode
     */
    private _setupAddMode() {
        // set form properties
        this.headerText = "Add New ExternalTraining";
        this.submitMessage = "ExternalTraining Added Successfully";
    }

    /**
     * [_getFormInfo] maps the form data to the data object being updated
     */
    private _getFormInfo() {
        
    }

    private _init() {
        this.users$ = this.getUsers();

        // map the list of available certificate types to the local variable
        this.externalTrainingTypes = this.externalTrainingService.externalTrainingTypes;
        // map the mode being used to the local variable
        this.isNewCertification = this._dialogData.isNewCertification;

        // determine how the [externalTrainingInfo] object should be set up
        this.externalTrainingInfo = this.isNewCertification ? new ExternalCreditCourseInfo() : this._dialogData.externalTrainingInfo;

        // initialize the file upload input for the DOR S.E.G. file
        this.fileUploadInput = {
            SelectedTab: "File",
            AvailableTabs: ["File"],
            FileUploadConfig: {
                autoSubmit: true,
                maxFileSize_MB: 50,
                apiRoot: API_URLS.Core,
                apiCallMethod: 'certifications/uploadCertification',
                validFileTypes: ['png', 'jpg', 'pdf'],
                additionalParameters: {

                }
            },
            showInstructions: false,
            useCustomTitle: true,
            customTitleText: 'ExternalTraining',
            showFileUploadedCard: true,
            preExistingFileUpload: this.externalTrainingInfo.AdditionalDetailsUploadPath
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
export class ExternalTraining_AddExternalTrainingDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<ExternalTraining_AddExternalTrainingDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(externalTrainingInfo: ExternalCreditCourseInfo, isNewCertification: boolean)
        : MatDialogRef<ExternalTraining_AddExternalTrainingDialog_Component> {

        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(externalTrainingInfo, isNewCertification);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(externalTrainingInfo, isNewCertification);
        }

        return this._matDialogRef;
    }

    private _openDialog(externalTrainingInfo: ExternalCreditCourseInfo, isNewCertification: boolean) {
        this._matDialogRef = this.matDialog.open(ExternalTraining_AddExternalTrainingDialog_Component, {
            data: {
                isNewCertification: isNewCertification,
                externalTrainingInfo: externalTrainingInfo
            },
            maxWidth: '550px',
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