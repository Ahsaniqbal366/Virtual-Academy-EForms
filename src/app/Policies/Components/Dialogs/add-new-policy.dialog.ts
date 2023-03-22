import { Component, OnInit, Injectable, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { PoliciesUserInfo, PoliciesAsessmentInfo, PoliciesInfo, PoliciesDetailInfo } from '../../Providers/policies.model';
import { PoliciesManagementService } from '../../Providers/policies.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { MaterialLoadingService } from 'src/app/shared/Material.Loading.Service';
import { Observable, Subject } from 'rxjs';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { AlertDialogFactory } from '../../../shared/Utilities/AlertDialog/alert-dialog';
import * as moment from 'moment';
import { formatDate } from '@angular/common';

// define component
@Component({
    selector: 'add-new-policy-dialog',
    templateUrl: 'add-new-policy.dialog.html',
    styleUrls: [
        '../../policies.page.scss'
    ]
})

export class PolicyManagement_AddPolicyDialog_Component implements OnInit {



    /**
     * PUBLIC  VARIABLES
     */
    // form variables (For new)
    public Editor = ClassicEditor;
    public editorConfig;
    public addPolicyForm: FormGroup;
    /**
     * START: Data passed in thru [_dialogData].
     * Unpacked on _init.
     */

    // dialog input variables
    public policiesInfo: PoliciesInfo;
    public policiesDetail: PoliciesDetailInfo[];
    public policiesUserInfo: PoliciesUserInfo[];
    public policiesAssesment: PoliciesAsessmentInfo[];

    // dialog input variable to control edit/add control
    public isNewPolicy: boolean;
    public isPolicyRenew: boolean;
    public isQuestionEmpty: boolean = false;
    public answerCheck: number;
    public correctOption: number;
    public questionHasCorrect: Array<any>


    /** END: Data passed in thru [_dialogData] */

    public initialized: boolean;
    public colSize: number = 12;

    public fieldDOBMaxValue: Date;

    public isSelectAllUser: boolean = true;
    public headerText: string;
    public submitBtnText: string;
    public submitMessage: string;

    public fileUploadInput: FileUploadComponentInput;

    public formControl = new FormControl();
    public filteredUserOptions: Observable<UserInfo[]>;
    public selectedUser: Array<any>;

    public users$: Observable<any[]>;
    public agenciesLoading = false;
    public agenciesInput$ = new Subject<string>();
    public formattedAgencyNameLabel: string;

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private _materialLoadingService: MaterialLoadingService,
        public policiesManagementService: PoliciesManagementService,
        private _dorFormSummaryDialog_Factory: PolicyManagement_AddPolicyDialog_Factory,
        private _formBuilder: FormBuilder,
        private _formFieldValidate_errorMessagesService: FormFieldValidate_ErrorMessagesService,
        private _alertDialogFactory: AlertDialogFactory,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
        this.fieldDOBMaxValue = new Date();
        this.addPolicyForm = this._formBuilder.group({
            assignmentUserIds: ['', []],
            policyNumber: ['', [Validators.required]],
            friendlyName: ['', [Validators.required]],
            effectiveDate: ['', Validators.required],
            reviewDate: ['', Validators.required],
            description: ['', Validators.required],
        });
    }
    /**
     * PUBLIC METHODS
     */

    onEffectiveDateChanged(eventData: any) {
        if (eventData.value) {
            this.addPolicyForm.controls['reviewDate'].setValue(moment(eventData.value).add(1, 'year').format());
        }
    }

    assignmentUser(eventData: any) {
        this.selectedUser = [];
        eventData.forEach(element => {
            this.selectedUser.push(element.UserID);
        });
        if (this.isNewPolicy) {
            this.policiesInfo.assignmentUserIds = this.selectedUser;
        }
        else {
            this.policiesInfo.assignmentUserIds = this.selectedUser;
        }
    }

    selectAllChecked(event) {
        if (event.target.checked) {
            this.isSelectAllUser = true;
        }
        else {
            this.isSelectAllUser = false;
        }
    }
    public sendUserData() {
        return this.policiesInfo.assignmentUserIds;
    }

    sendQuestionsData(eventData: any) {
        this.policiesInfo.policyAssessments[0] = eventData;
    }
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
        if (this.addPolicyForm.valid) {
            // map the form data to a [PoliciesInfo] object
            this._getFormInfo();

            // submit the form
            this._submitForm();
        }

    }

    public closeDialog(): void {
        this._dorFormSummaryDialog_Factory.closeDialog(false, null);
    }

    /**
     * [showAssesmentButtonClick] is called when the showing assesment options.
     */
    public showAssesmentButtonClick() {
        this.colSize = 7;
        const assessmentSection = document.getElementById('assessmentSection');
        assessmentSection.style.display = 'block';
        const questionClose = document.getElementById('questionClose');
        questionClose.style.display = 'none';
    }

    /**
     * [hideAssesmentOnClick] is called when the showing assesment options.
     */
    public hideAssesmentOnClick() {
        this.colSize = 12;
        const assessmentSection = document.getElementById('assessmentSection');
        assessmentSection.style.display = 'none';
    }

    //  didn't needed. Will Remove after making sure
    public addAssesmentCard() {
        const newCard = document.getElementById('newCard');
        newCard.style.display = 'block';
    }
    
//  didn't needed. Will Remove after making sure
    public matContainerStyle() {
       // var matContainer = document.getElementsByClassName('mat-dialog-container');
        // As the material is updated and class:  mat-dialog-container  change to class: mat-mdc-dialog-container
        
        var matContainer = document.getElementsByClassName('mat-mdc-dialog-container');
        var matContainerNode = matContainer[0];
        const matContainerID = document.getElementById(matContainerNode.id);
        matContainerID.style.position = 'relative';
        matContainerID.style.padding = '17px 15px 24px 14px';
    }
    /**
     * [onPoliciesUploaded] triggers when a policy file is uploaded
     */
    public onPoliciesUploaded(fileUploadPath: any) {
        // set the upload path to the uploaded file path
        this.policiesInfo.policyFilePath = fileUploadPath.relativePath;
    }

    /**
     * [onClearPoliciesUploadBtn] clears the currently stored cloudpath for the policy upload
     */
    public onClearPoliciesUploadBtn() {
        // clear the upload path for the policy
        this.policiesInfo.policyFilePath = "";
    }

    /**
     * PRIVATE METHODS
     */

    /**
     * [_submitForm] submits the [PolicyInfo] object to the DB
     */
    private _submitForm() {
        this.correctOption = 0;
        let error: string = '';
        let isSubmit: boolean = true;
        if (this.policiesInfo.assignmentUserIds == null || this.policiesInfo.assignmentUserIds.length == 0) {
            isSubmit = false;
            error = 'Kindly assign users to Policy';
        }else {
            let isValidatePolicyAssessment: boolean = false;
            if ('policyAssessments' in this.policiesInfo && this.policiesInfo.policyAssessments && this.policiesInfo.policyAssessments.length) {
                isValidatePolicyAssessment = true;
            }
            if (isValidatePolicyAssessment) {
                let res = PoliciesManagementService.validateAssessment(this.policiesInfo.policyAssessments[0]);
                if (res.isSubmit && res.isEmpty == false) {
                    isValidatePolicyAssessment = false;
                } else if (res.isEmpty) {
                    this.policiesInfo.policyAssessments = [];
                    isValidatePolicyAssessment = false;
                } else {
                    isSubmit = false;
                    error = res.errorMsg;
                }
            }

            if (!isValidatePolicyAssessment && isSubmit) {
                this._materialLoadingService.presentLoading("Submitting policy...");
                if (this.isNewPolicy) {
                    this.policiesManagementService.addPolicy(this.policiesInfo).subscribe((data: PoliciesInfo) => {
                        this._toastService.presentToast(this.submitMessage);
                        this._materialLoadingService.dismissLoading();
                        this._dorFormSummaryDialog_Factory.closeDialog(true, data);
                    },
                        (error: APIResponseError) => {
                            console.error('policies-error: ', error);
                            this.initialized = true;
                            this._materialLoadingService.dismissLoading();
                        }
                    );
                } else if (this.isPolicyRenew == true) {
                    this.policiesInfo.policyFilePath = this.policiesInfo.policyFilePath;
                    this.policiesInfo.policyFilePath = this.policiesInfo.policyFilePath == undefined ? "" : this.policiesInfo.policyFilePath;
                    this.policiesManagementService.renewPolicy(this.policiesInfo).subscribe((data: PoliciesInfo) => {
                        this._toastService.presentToast(this.submitMessage);
                        this._materialLoadingService.dismissLoading();
                        this._dorFormSummaryDialog_Factory.closeDialog(true, data, true);
                    },
                        (error: APIResponseError) => {
                            console.error('policies-error: ', error);
                            this.initialized = true;
                            this._materialLoadingService.dismissLoading();
                        }
                    );
                }
            }
        }

        if (error && isSubmit == false) {
            this._alertDialogFactory.openDialog({
                header: 'Error',
                message: error,
                buttonText: 'OK',
                disableClose: false
            });
        }
    }

    /**
     * [_setupRenewMode] maps the incoming data object to the corresponding form controls
     * when the form is in 'Renew' mode
     */
    private _setupRenewMode() {
        var assignmentUserIds = [];
        this.policiesInfo.policyAssignments.forEach(element => {
            assignmentUserIds.push(element.userId);
        });
        this.policiesInfo.assignmentUserIds = assignmentUserIds;
        this.policiesInfo.assignmentUserIds = assignmentUserIds;
        // set form properties
        this.headerText = "Renew Policy";
        this.submitMessage = "Policy Renewed Successfully";
    }

    /**
     * [_setupEditMode] maps the incoming data object to the corresponding form controls
     * when the form is in 'Add' mode
     */
    private _setupAddMode() {
        // set form properties
        this.headerText = "Add New Policy";
        this.submitMessage = "Policy Added Successfully";
    }

    /**
     * [_getFormInfo] maps the form data to the data object being updated
     */
    private _getFormInfo() {
        if (this.isPolicyRenew) {
            this.policiesInfo.policyNumber = this.addPolicyForm.get("policyNumber").value;
            this.policiesInfo.friendlyName = this.addPolicyForm.get("friendlyName").value;
            this.policiesInfo.effectiveDate = this.addPolicyForm.get("effectiveDate").value;
            this.policiesInfo.reviewDate = this.addPolicyForm.get("reviewDate").value;
            this.policiesInfo.body = this.addPolicyForm.get("description").value;
            this.policiesInfo.policyStatusId = 0;
            this.policiesInfo.isSelectAll = this.isSelectAllUser;

        } else if (this.isNewPolicy) {
            this.policiesInfo.policyNumber = this.addPolicyForm.get("policyNumber").value;
            this.policiesInfo.friendlyName = this.addPolicyForm.get("friendlyName").value;
            this.policiesInfo.effectiveDate = this.addPolicyForm.get("effectiveDate").value;
            this.policiesInfo.reviewDate = this.addPolicyForm.get("reviewDate").value;
            this.policiesInfo.body = this.addPolicyForm.get("description").value;
            this.policiesInfo.policyStatusId = 0;
            this.policiesInfo.isSelectAll = this.isSelectAllUser;
            this.policiesInfo.assignmentUserIds = this.selectedUser;
        }
    }

    /**
     * [_getUncategorizedPolicyType] returns the 'Uncategorized' type category
     * for an entry submission when no [PolicyType] is selected
     */
    // private _getUncategorizedPolicyType(){
    // return this.policiesAssesment.filter(t => t.Title == "Uncategorized")[0].PoliciesAssesmentID;
    // }

    private _init() {
       //Commented as it didn't needed.
        // this.matContainerStyle();
        // map the mode being used to the local variable
        this.isNewPolicy = this._dialogData.isNewPolicy;
        this.isPolicyRenew = this._dialogData.isPolicyRenew;

        // determine how the [PoliciesInfo] object should be set up
        if (this.isNewPolicy) {
            this.policiesInfo = new PoliciesInfo();
            this._getFormInfo();
        }
        else if (this.isPolicyRenew) {
            this.policiesInfo = JSON.parse(JSON.stringify(this._dialogData.policiesInfo));
            this.isSelectAllUser = this.policiesInfo.isSelectAll;
            this.policiesInfo.assignmentUserIds = this.selectedUser;
        }

        if (this.isNewPolicy) {
            this._setupAddMode();
        } else if (this.isPolicyRenew) {
            this._setupRenewMode();
        }

        // Attach values to form
        this.addPolicyForm.patchValue({
            assignmentUserIds: [],
            policyNumber: this.policiesInfo?.policyNumber ?? '',
            friendlyName: this.policiesInfo?.friendlyName ?? '',
            description: this.policiesInfo?.body ?? '',
        });

        if (this.policiesInfo?.effectiveDate) {
            let date = moment(this.policiesInfo.effectiveDate).format();
            this.addPolicyForm.controls.effectiveDate.setValue(date ?? '');
        }

        if (this.policiesInfo?.reviewDate) {
            let date = moment(this.policiesInfo.reviewDate).format();
            this.addPolicyForm.controls.reviewDate.setValue(date ?? '');
        }

        // initialize the file upload input for the file
        this.fileUploadInput = {
            SelectedTab: "File",
            AvailableTabs: ["File"],
            FileUploadConfig: {
                autoSubmit: true,
                maxFileSize_MB: 50,
                apiRoot: API_URLS.Policies,
                apiCallMethod: 'Upload/api/v1/upload-Policy-File',
                validFileTypes: ['png', 'jpg', 'jpeg', 'pdf'],
                additionalParameters: {

                }
            },
            showInstructions: false,
            useCustomTitle: false,
            customTitleText: 'Policy',
            showFileUploadedCard: true,
            preExistingFileUpload: this.isNewPolicy ? this.policiesInfo.policyFilePath : this.policiesInfo.policyFilePath
        };

        this.initialized = true;
    }
    /**
     * SELF INIT
     */
    ngOnInit() {
        this.editorConfig = {
            toolbar: {
              items: ['heading', '|', 'bold', 'italic', "link", '|', 'bulletedList', 
              'numberedList', '|', "indent", "outdent", '|', 'blockQuote', 'insertTable',
              'undo', 'redo'
            ]
            },
            table: {
              contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
            },
          };
        this._init();
    }
}



@Injectable()
export class PolicyManagement_AddPolicyDialog_Factory {
    constructor(
        private matDialog: MatDialog,
        private _materialLoadingService: MaterialLoadingService,
    ) { }

    private _matDialogRef: MatDialogRef<PolicyManagement_AddPolicyDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(policiesInfo: PoliciesInfo, isNewPolicy: boolean)
        : MatDialogRef<PolicyManagement_AddPolicyDialog_Component> {

        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(policiesInfo, isNewPolicy);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(policiesInfo, isNewPolicy);
        }

        return this._matDialogRef;
    }

    private _openDialog(policiesInfo: PoliciesInfo, isNewPolicy: boolean) {
        // this._materialLoadingService.presentLoading("Loading Data..");
        this._matDialogRef = this.matDialog.open(PolicyManagement_AddPolicyDialog_Component, {
            data: {
                isPolicyRenew: false,
                isNewPolicy: isNewPolicy,
                policiesInfo: policiesInfo
            },
            maxWidth: '1200px',
            autoFocus: false
        });
    }

    public openDialogReissue(policiesDetail: PoliciesInfo, isPolicyRenew: boolean)
        : MatDialogRef<PolicyManagement_AddPolicyDialog_Component> {

        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialogReissue(policiesDetail, isPolicyRenew);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialogReissue(policiesDetail, isPolicyRenew);
        }

        return this._matDialogRef;
    }

    private _openDialogReissue(policiesDetail: PoliciesInfo, isPolicyRenew: boolean) {
        this._matDialogRef = this.matDialog.open(PolicyManagement_AddPolicyDialog_Component, {
            data: {
                isNewPolicy: false,
                isPolicyRenew: isPolicyRenew,
                policiesInfo: policiesDetail
            },
            maxWidth: '1200px',
            autoFocus: false
        });
    }

    public closeDialog(confirmed: boolean, record: PoliciesInfo, isRenewed: boolean = false): void {
        this._matDialogRef.close({
            dismissed: true,
            confirmed: confirmed,
            record: record,
            isRenewed: isRenewed
        });

        this._matDialogRef = null;
    }
}