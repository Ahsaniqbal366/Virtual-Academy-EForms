import { Component, OnInit, Input, Injectable, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { PoliciesUserInfo, PoliciesAsessmentInfo, PoliciesInfo, PoliciesDetailInfo } from '../../Providers/policies.model';
import { PoliciesManagementService } from '../../Providers/policies.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { MaterialLoadingService } from 'src/app/shared/Material.Loading.Service';
import { Observable, Subject, of } from 'rxjs';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MatRadioChange } from '@angular/material/radio';
import { NgxExtendedPdfViewerService } from 'ngx-extended-pdf-viewer';

interface UserAssessmentAnswer {
    questionId: Number;
    answerId: Number;
}

interface UserAssessment {
    userId: Number;
    assessmentId: Number;
    policyIssueId: Number;
    lstPolicyQuestionAnswers: Array<any>
}

interface AcknowledgeAssessment {
    userId: Number;
    policyIssueId: Number;
}

// define component
@Component({
    selector: 'user-assesment-policy.dialog',
    templateUrl: 'user-assesment-policy.dialog.html',
    styleUrls: [
        '../../policies.page.scss'
    ]
})

export class PolicyManagement_UserAssesmentDialog_Component implements OnInit {

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        public policiesManagementService: PoliciesManagementService,
        private _dorFormSummaryDialog_Factory: PolicyManagement_UserAssesmentDialog_Factory,
        // private _showPolicyAssesmentFactory: PolicyManagement_AddPolicyAssesmentDialog_Factory,
        private _formBuilder: FormBuilder,
        private _loadingService: IonicLoadingService,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
        this.Editor.ckeConfig = {
            allowedContent: false,
            forcePasteAsPlainText: true,
            removePlugins: 'horizontalrule,tabletools,specialchar,about,list,others',
            removeButtons: 'Save,NewPage,Preview,Print,Templates,Replace,SelectAll,Form,Checkbox,Radio,TextField,Textarea,Find,Select,Button,ImageButton,HiddenField,JustifyLeft,JustifyCenter,JustifyRight,JustifyBlock,CopyFormatting,CreateDiv,BidiLtr,BidiRtl,Language,Flash,Smiley,PageBreak,Iframe,Font,FontSize,TextColor,BGColor,ShowBlocks,Cut,Copy,Paste,Table,Image,Format,Source,Maximize,Styles,Anchor,SpecialChar,PasteFromWord,PasteText,Scayt,Undo,Redo,Strike,RemoveFormat,Indent,Outdent,Blockquote,Underline'
        };
    }
    /**
     * PUBLIC  VARIABLES
     */

    // dialog input variables
    public Editor = ClassicEditor;
    public policiesInfo: PoliciesInfo;
    public policiesDetail: PoliciesDetailInfo;
    public policiesUserInfo: PoliciesUserInfo[];
    public policiesAssesment: PoliciesAsessmentInfo;
    public pdfURL: string;
    public typeURL: string;
    protected userAssessment: UserAssessment[];
    protected userAssessmentAnswer: UserAssessmentAnswer[] = [];
    protected userAssessmentAnswerSubmit: UserAssessmentAnswer;
    protected policiesAcknowledgment: AcknowledgeAssessment[] = [{
        userId: 0,
        policyIssueId: 0,
    }];

    public initialized: boolean;
    public assessmentStatus: boolean = false;
    public contentEditable: boolean = false;
    public policyAssessmentStatusId: boolean;
    public policyAssessmentPassed: boolean;
    public isAssessment: boolean = true;                    // Is Assesment availables

    input: any = null; // Current question ref

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
    title = 'newMat';

    isLinear = true;
    AssesmentFormGroup: FormGroup;

    questionPreviewIndex: number = 0;

    submit() {
        console.log(this.AssesmentFormGroup.value);
    }

    finalArray: any[] = [];

    radioChange(event: MatRadioChange, option: any, answers: any) {
        // user interaction object
        var obj = {
            questionId: option.policyAssessmentQuestionId,
            answerId: option.policyAssessmentAnswerId,
        };

        // Update in case of previous question visit 
        if (this.userAssessmentAnswer.find(x => x.questionId == obj.questionId)) {
            this.userAssessmentAnswer = this.userAssessmentAnswer.filter(x => x.questionId != obj.questionId);
        }


        // Record user assesmments 
        this.userAssessmentAnswer.push(obj);


        this.persistUserEntry(option, answers);
        this.AssesmentFormGroup.controls["q-" + obj.questionId].setValue(obj.answerId);
    }

    persistUserEntry(option: any, answers: any) {
        answers.map(item => item.userSelected = null);
        option.userSelected = option.policyAssessmentAnswerId;
    }

    contentLoaded() {
        // console.log('File loaded');
    }

    nextValidator(i: number, selectedOption: any, isNext: boolean = true) {
        let checkSelected: boolean = true;

        selectedOption.forEach(element => {
            if (element.isUserSelected == false) {
                checkSelected = false
            }
        });

        if (this.policyAssessmentStatusId == false) {
            if (this.AssesmentFormGroup.controls["q-" + i].invalid) {
                this._toastService.presentToast("Kindly choose one option.");
            }
        }

        if (isNext) {
            if (this.questionPreviewIndex < this.policiesAssesment.policyAssessmentQuestions.length) {
                this.questionPreviewIndex += 1;
                this.updateInput();
            }
        }
    }

    navigateBack() {
        if (this.questionPreviewIndex >= 1) {
            this.questionPreviewIndex -= 1;
            this.updateInput();
        }
    }

    updateInput(isMark: boolean = true) {
        this.input = this.policiesAssesment.policyAssessmentQuestions[this.questionPreviewIndex];
    }

    toggleEditable(event) {
        if (event.checked) {
            this.contentEditable = true;
        }else {
            this.contentEditable = false;
        }
    }
    /**
     * PRIVATE METHODS
     */
    public storingData() {
        console.log("check data", this.policiesDetail);
        this.userAssessment = [{
            userId: 0,
            assessmentId: this.policiesDetail.policyAssessments[0].policyAssessmentId,
            policyIssueId: this.policiesDetail.policyIssueId,
            lstPolicyQuestionAnswers: this.userAssessmentAnswer,
        }];
        return this.userAssessment;
    }


    public closeDialog(confirmed: boolean = false): void {
        this._dorFormSummaryDialog_Factory.closeDialog(confirmed, null);
    }


    public submitAssessment(validateQ: number, answers: any) {
        this.nextValidator(validateQ, answers, false);
        if (this.AssesmentFormGroup.valid) {
            this.userAssessment = this.storingData();
            this.policiesManagementService.addUpdateAssessment(this.userAssessment).subscribe((response) => {
                if (response['assessmentStatus'] == true) {
                    this.assessmentStatus = true;  // Assessment Passed
                    // stepper.next();
                    this._toastService.presentToast("Assessment Passed!");
                }
                else {
                    this._toastService.presentToast("You have failed the assessment. Kindly try again");
                    this.closeDialog();
                    this.assessmentStatus = false;
                }

            },
                (error: APIResponseError) => {
                    console.log('policies-error: ', error);
                    this.initialized = true;
                    this._loadingService.dismissLoading();
                }
            );
        }
        else {
            this._toastService.presentToast("Kindly attempt all questions in assessment.");
        }
    }

    public matContainerStyle() {
       //new Material Class:  mat-mdc-dialog-container mdc-dialog cdk-dialog-container mdc-dialog--open
      //  var matContainer = document.getElementsByClassName('mat-dialog-container');
        var matContainer = document.getElementsByClassName('mat-mdc-dialog-container');
        var matContainerNode = matContainer[0];
        const matContainerID = document.getElementById(matContainerNode.id);
        matContainerID.style.position = 'relative';
        matContainerID.style.width = '900px';
        matContainerID.style.height = 'auto';
    }


    public acknowledgeAssessment() {
        if (this.contentEditable) {
            if (this.isAssessment == true) {
                this.userAssessment = this.storingData();
            }
            this.policiesAcknowledgment[0].policyIssueId = this.policiesDetail.policyIssueId;
            this.policiesManagementService.acknowledgmentAssessment(this.policiesAcknowledgment).subscribe((response) => {
                this.closeDialog(true);
                this._toastService.presentToast("Policy Acknowledged.");
            },
                (error: APIResponseError) => {
                    console.log('policies-error: ', error);
                    this.initialized = true;
                    this._loadingService.dismissLoading();
                }
            );
        }
        else {
            this._toastService.presentToast("Kindly check the above checkbox.");
        }

    }
    /**
     * [_displayQuestions] maps the incoming data object to the corresponding form controls
     * when the form is in 'Renew' mode
     */
    private async _displayQuestions(): Promise<void> {
        return new Promise((resolve, reject) => {

            this.policiesManagementService.getPoliciesDetailsForCurrentUser(this.policiesInfo.policyId, 0).subscribe(
                (policies) => {
                    this.policiesDetail = policies as PoliciesDetailInfo;
                    this.policiesAssesment = this.policiesDetail.policyAssessments[0];
                    if (this.policiesAssesment) {
                        this.policiesDetail.policyAssessments[0].policyAssessmentQuestions.forEach(element => {
                            element.policyAssessmentAnswers.forEach(answers => {
                                if (answers.isUserSelected == true) {
                                    var obj = {
                                        questionId: answers.policyAssessmentQuestionId,
                                        answerId: answers.policyAssessmentAnswerId,
                                    };
                                    this.userAssessmentAnswer.push(obj);
                                }
                            });
                            this.userAssessment = [{
                                userId: 0,
                                assessmentId: element.policyAssessmentId,
                                policyIssueId: this.policiesDetail.policyAssessments[0].policyIssueId,
                                lstPolicyQuestionAnswers: this.userAssessmentAnswer,
                            }];
                        });

                        // initialize the file upload input for the file
                        for (let item of this.policiesAssesment.policyAssessmentQuestions) {
                            this.AssesmentFormGroup.addControl('q-' + item.policyAssessmentQuestionId, new FormControl('', Validators.required));

                            //View mode select default user record response
                            if(item && item.policyAssessmentAnswers) {
                                let option = item.policyAssessmentAnswers.find(x => x.isUserSelected == true);
                                if(option) {
                                    this.persistUserEntry(option, item.policyAssessmentAnswers);
                                }
                            }
                        }
                        
                        this.updateInput();

                        //Failed And can take
                        if (this.policiesDetail.policyAssessments[0].policyAssessmentStatusId == 1 && this.policiesDetail.policyAssessments[0].canTakeAssessment == true) {
                            this.policyAssessmentStatusId = false;
                            this.assessmentStatus = false;
                        }
                        else if (this.policiesDetail.policyAssessments[0].policyAssessmentStatusId == 2) {
                            this.policyAssessmentStatusId = true;
                            this.assessmentStatus = true;
                        }
                        else {
                            this.policyAssessmentStatusId = true;
                            this.assessmentStatus = false;
                        }
                    }else {
                        this.isAssessment = false;
                    }
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
                        useCustomTitle: true,
                        customTitleText: 'Policy Document',
                        showFileUploadedCard: true,
                        preExistingFileUpload: this.policiesDetail.policyFilePath
                    };
                    this.pdfURL = this.policiesDetail.policyFilePath;
                    if(this.pdfURL) {        
                        console.log("check url", this.pdfURL);
                        this.typeURL = this.pdfURL.split(/[#?]/)[0].split('.').pop().trim();
                        this.typeURL = this.typeURL.toUpperCase();
                    }
                    resolve();
                },
                (error) => {
                    console.error('policies-error: ', error);
                    reject();
                });
        });
    }

    private _init() {
        this.matContainerStyle();
        this.policiesInfo = this._dialogData.policiesInfo;
        this._displayQuestions();
        this.AssesmentFormGroup = this._formBuilder.group({});

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
export class PolicyManagement_UserAssesmentDialog_Factory {
    constructor(
        private matDialog: MatDialog,
        private _materialLoadingService: MaterialLoadingService,
    ) { }

    private _matDialogRef: MatDialogRef<PolicyManagement_UserAssesmentDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(policiesInfo: PoliciesInfo)
        : MatDialogRef<PolicyManagement_UserAssesmentDialog_Component> {

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
        this._matDialogRef = this.matDialog.open(PolicyManagement_UserAssesmentDialog_Component, {
            data: {
                policiesInfo: policiesInfo
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