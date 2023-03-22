import { Component, OnInit, Input, Injectable, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { PoliciesAsessmentInfo } from '../../Providers/policies.model';
import { PoliciesManagementService } from '../../Providers/policies.service';
import { ToastService } from 'src/app/shared/Toast.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { MaterialLoadingService } from 'src/app/shared/Material.Loading.Service';
import { Observable, Subject, timer } from 'rxjs';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';
import { Output, EventEmitter } from '@angular/core';
import { AlertDialogFactory } from '../../../shared/Utilities/AlertDialog/alert-dialog';

interface optionInput {
    answerBody: string,
    isCorrect: boolean,
    isActive: boolean,
    isDeleted: boolean,
    policyAssessmentAnswerId: number,
    policyAssessmentQuestionId: number,
    key: string,
}
interface addPolicyQuestions {
    questionBody: string,
    pointsAvailable: number,
    isActive: boolean,
    isDeleted: boolean,
    policyAssessmentId: number,
    policyAssessmentQuestionId: number,
    policyAssessmentAnswers: Array<any>,
    key: string,
}

export interface IAddPolicyAssesment {
    version: number,
    isActive: boolean,
    isDeleted: boolean,
    policyAssessmentId: number,
    policyAssessmentQuestions: Array<any>,
}


var policyAssesmentId = 0;
// define component
@Component({
    selector: 'add-new-assesment-dialog',
    templateUrl: 'add-new-assesment.dialog.html',
    styleUrls: [
        '../../policies.page.scss'
    ]
})

export class PolicyManagement_AddPolicyAssesmentDialog_Component implements OnInit, OnDestroy {

    // define service provider and route provider when component is constructed
    constructor(
        public policiesManagementService: PoliciesManagementService,
        private _dorFormSummaryDialog_Factory: PolicyManagement_AddPolicyAssesmentDialog_Factory,
        private _formFieldValidate_errorMessagesService: FormFieldValidate_ErrorMessagesService,
        private _alertDialogFactory: AlertDialogFactory,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
    }

    /**
     * PUBLIC  VARIABLES
     */
    // form variables (For new)
    @Output() sendQuestionsData = new EventEmitter();
    @Output() colSize = new EventEmitter();

    @Input() public assignmentTitle: string;
    @Input() public assesmentData: Array<IAddPolicyAssesment> = null;

    public randKey (str: string) {
         return str+'-'+ this.randNo;
    }

    public get randNo () {
        return Math.floor(Math.random() * 1000);
    }
    
    public firstQustionKey: string = `q-${this.randNo}`;
    
    protected optionInput: optionInput[] = [{
        answerBody: '',
        isCorrect: true,
        isActive: true,
        isDeleted: false,
        policyAssessmentAnswerId: 0,
        policyAssessmentQuestionId: 0,
        key: `${this.firstQustionKey}-opt-${this.randNo}`
    }];

    public addPolicyQuestions: addPolicyQuestions[] = [{
        questionBody: '',
        pointsAvailable: 0,
        isActive: true,
        isDeleted: false,
        policyAssessmentId: 0,
        policyAssessmentQuestionId: 0,
        key: this.firstQustionKey,
        policyAssessmentAnswers: this.optionInput,
    }];

    protected addPolicyAssesment: IAddPolicyAssesment = {
        version: 0,
        isActive: true,
        isDeleted: false,
        policyAssessmentId: 0,
        policyAssessmentQuestions: this.addPolicyQuestions,
    };

    /**
     * START: Data passed in thru [_dialogData].
     * Unpacked on _init.
     */

    // dialog input variables
    public policiesAssesment: PoliciesAsessmentInfo[];

    // dialog input variable to control edit/add control
    public isNewPolicy: boolean;
    public isRenew: boolean;
    public isCheckboxSet: boolean = false;
    public optionInputVal: string;

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
    onChangeOptionEvent(event: any, getOption, i, j) {
        getOption.answerBody = event.target.value;
        this.addPolicyQuestions[i].policyAssessmentAnswers[j].answerBody = event.target.value;
        var getID = event.target.id;
        this.sendQuestionsData.emit(this.addPolicyAssesment);
    }

    onChangeQuestionEvent(event: any) {
        // console.log(event.target.value);
        this.sendQuestionsData.emit(this.addPolicyAssesment);
    }

    public checkboxToggle(event: any, data: any, questionData: any) {
        questionData.policyAssessmentAnswers.forEach(function (element, i) {
            if (element.isCorrect == true) {
                element.isCorrect = false;
            }
        });

        if (event.checked && this.isCheckboxSet == false) {
            data.isCorrect = true;
        }
        else {
            data.isCorrect = false;
        }
    }

    changeData(event, getOption: any) {
        this.optionInputVal = event;
    }

    /**
        * [getFieldErrorMessage] formats the error message to display on the input field
        */
    public getFieldErrorMessage(field: AbstractControl): string {
        return this._formFieldValidate_errorMessagesService.getFieldErrorMessage(field);
    }

    /**
     * [showAssesmentButtonClick] is called when the showing assesment options.
     */
    public addOption(i: number, questioninput: any) {
        var setBool: Boolean;
        questioninput.policyAssessmentAnswers.forEach(element => {
            if (element.isCorrect == true) {
                setBool = false;
            }
        });
        let question = this.addPolicyQuestions[i];
        question.policyAssessmentAnswers.push({
            answerBody: '',
            isCorrect: setBool == false ? false : true,
            isActive: true,
            isDeleted: false,
            policyAssessmentAnswerId: 0,
            policyAssessmentQuestionId: 0,
            key: this.randKey(`${question?.key ?? 'q-'+i}-opt`)
        });
    }

    public removeOption(j: number, questionNumber: number) {
        let question = this.addPolicyQuestions[questionNumber];
        if (question) {
            question.policyAssessmentAnswers.splice(j, 1);
        }
        timer(0).subscribe(() => {
            this.sendQuestionsData.emit(this.addPolicyAssesment);
        });
    }

    public addNewQuestion() {
        this.addPolicyQuestions.push({
            questionBody: '',
            pointsAvailable: 0,
            isActive: true,
            isDeleted: false,
            policyAssessmentId: this.addPolicyAssesment['policyAssessmentId'] ?? 0,
            policyAssessmentQuestionId: 0,
            policyAssessmentAnswers: [],
            key: this.randKey('q')
        });
        this.sendQuestionsData.emit(this.addPolicyAssesment);
    }
    
    public removeQuestion(i: number) {
        this.addPolicyQuestions.splice(i, 1);
        timer(0).subscribe(() => {
            this.sendQuestionsData.emit(this.addPolicyAssesment);
        });
    }

    public logValue() {
        console.log(this.addPolicyQuestions);
    }

    public showAssesmentButtonClick() {
        const box = document.getElementById('addNewFirst');
        box.style.display = 'none';
        const hideDialogAssesment = document.getElementById('hideDialogAssesment');
        hideDialogAssesment.style.display = 'block';
    }

    public closeDialog(): void {
        this._dorFormSummaryDialog_Factory.closeDialog(false, this.addPolicyAssesment);
    }

    public submitOnUpdate() {
        let res = PoliciesManagementService.validateAssessment(this.addPolicyAssesment);
        if (res.isSubmit && res.isEmpty == false) {
            this._dorFormSummaryDialog_Factory.closeDialog(true, this.addPolicyAssesment);
            this.sendQuestionsData.emit(this.addPolicyAssesment);
        } else if (res.isEmpty) {
            this._dorFormSummaryDialog_Factory.closeDialog(true, null);
            this.sendQuestionsData.emit(null);
        } else {
            this._alertDialogFactory.openDialog({
                header: 'Empty Question!',
                message: res.errorMsg,
                buttonText: 'OK',
                disableClose: false
            });
        }
    }

    public matContainerStyle() {
        //var matContainer = document.getElementsByClassName('mat-dialog-container');
        // As the material is updated and class:  mat-dialog-container  change to class: mat-mdc-dialog-container
        
        var matContainer = document.getElementsByClassName('mat-mdc-dialog-container');
        var matContainerNode = matContainer[0];
        const matContainerID = document.getElementById(matContainerNode.id);
        matContainerID.style.position = 'relative';
        //matContainerID.style.padding = '17px 15px 55px 14px';
    }

    /**
         * [_setupEditMode] maps the incoming data object to the corresponding form controls
         * when the form is in 'Edit' mode
         */
    private _setupEditMode(obj: any) {

        //Setting Recevied Assessment
        this.addPolicyAssesment = obj;

        //Updating question of Received Updates
        if (obj && obj.policyAssessmentQuestions) {
            this.addPolicyQuestions = obj.policyAssessmentQuestions;
            obj.policyAssessmentQuestions.forEach(element => {
                this.optionInput = element.policyAssessmentAnswers;
            });
        }
    }

    /**
     * [_setupEditMode] maps the incoming data object to the corresponding form controls
     * when the form is in 'Add' mode
     */
    private _setupAddMode() {
        this.submitMessage = "Question Added Successfully";
    }

    private _init() {

        this.matContainerStyle();

        // Coming from dialog
        this.isNewPolicy = this._dialogData.isNewPolicy;
        this.isRenew = this._dialogData.isRenew;

        // Coming from assessmetn Detail
        if (this.isNewPolicy || this.isRenew) {   // these check only coming from detail
            this.assesmentData = this.isNewPolicy ? this.addPolicyAssesment : JSON.parse(JSON.stringify(this._dialogData.assessment));
            this._setupEditMode(this.assesmentData);
        } else {
            if (this.assesmentData && this.assesmentData.length) {
                this._setupEditMode(this.assesmentData[0]);
            } else {
                this._setupAddMode();
            }
        }
        this.initialized = true;
    }

    /**
     * SELF INIT
     */
    ngOnInit() {
        this._init();
    }

    ngOnDestroy() {
        this._dialogData.policiesInfo = null;
    }
}


@Injectable()
export class PolicyManagement_AddPolicyAssesmentDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<PolicyManagement_AddPolicyAssesmentDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(assessment: IAddPolicyAssesment, isNewPolicy: boolean, isRenew: boolean)
        : MatDialogRef<PolicyManagement_AddPolicyAssesmentDialog_Component> {
        // this.isEdit = true;
        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(assessment, isNewPolicy, isRenew);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(assessment, isNewPolicy, isRenew);
        }

        return this._matDialogRef;
    }

    private _openDialog(assessment: IAddPolicyAssesment, isNewPolicy: boolean, isRenew: boolean) {
        this._matDialogRef = this.matDialog.open(PolicyManagement_AddPolicyAssesmentDialog_Component, {
            data: {
                isNewPolicy: isNewPolicy,
                isRenew: isRenew,
                assessment: assessment
            },
            panelClass: 'my-custom-dialog-class',
            width: '900px',
            autoFocus: false
        });
    }

    public closeDialog(confirmed: boolean, record: any): void {
        this._matDialogRef.close({
            dismissed: true,
            confirmed: confirmed,
            record: record
        });

        this._matDialogRef = null;
    }
}