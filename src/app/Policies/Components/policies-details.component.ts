import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { PoliciesInfo, PoliciesDetailInfo, PoliciesAsessmentInfo, MatTableDefinitionForExport, PoliciesAssignments } from '../Providers/policies.model';
import { PolicyManagement_AddPolicyDialog_Factory } from 'src/app/Policies/Components/Dialogs/add-new-policy.dialog'
import { PoliciesManagementService } from '../Providers/policies.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { AlertController } from '@ionic/angular';
import { IAddPolicyAssesment, PolicyManagement_AddPolicyAssesmentDialog_Factory } from './Dialogs/add-new-assesment.dialog';
import { PolicyManagement_UserSelectTableDialog_Factory } from './Dialogs/user-select-table-dialog';
import { Policies_ArchivePoliciesDialog_Factory } from './Dialogs/archive-policies.dialog';
import { Policies_AuditLogDialog_Factory } from './AuditLog/Dialog/policies-audit-log.dialog';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { AlertDialogFactory } from '../../shared/Utilities/AlertDialog/alert-dialog';
import { ECrudActions, TPoliciesCB } from '../model/t-polices-actions';
import * as moment from 'moment';
import { PoliciesPDFExportService } from '../Providers/policies-pdf-export.service';
import { SharedConstant } from 'src/app/shared/models/Shared.Constant';
import { MatTableDataSource } from '@angular/material/table';

interface UpdateInfo {
    policyId: Number;
    policyNumber: string;
    assignmentUserIds: Array<any>;
    friendlyName: string;
    isSelectAll: boolean;
    body: string;
    effectiveDate: string;
    reviewDate: string;
    policyIssueId: number;
    policyIssueStatusId: number;
    policyFilePath: string;
    policyAssessments: Array<any>;
}
@Component({
    selector: 'policies-details',
    templateUrl: 'policies-details.component.html',
    styleUrls: [
        '../policies.page.scss'

    ]
})

export class PoliciesDetails_Component implements OnInit {


    @Input()
    initFrom: string = 'admin';
    @Input()
    isArchive:boolean=false;
    //use just policy number
    @Input() policiesInfo: PoliciesInfo;

    @Input() policiesUserInfo: Array<any>;
    // when a policies is updated
    @Output() onPoliciesUpdated: EventEmitter<TPoliciesCB<PoliciesDetailInfo>> = new EventEmitter();
    // when a policies is archived
    @Output() onPoliciesArchived: EventEmitter<PoliciesInfo> = new EventEmitter();

    public Editor = ClassicEditor;
    public editorConfig;
    public policiesDataSource: any;
    public initialized: boolean;
    public assignmentUserIds: Array<any> = [];
    public fileUploadInput: FileUploadComponentInput;
    public policiesDetail: PoliciesInfo;
    public policiesAssessment: PoliciesAsessmentInfo;

    public updatePolicyForm = this._formBuilder.group({
        policyNumber: ['', [Validators.required]],
        friendlyName: ['', [Validators.required]],
        effectiveDate: ['', Validators.required],
        reviewDate: ['', Validators.required],
        description: ['', Validators.required]
    });

    protected policiesUpdateInfo: UpdateInfo = {
        policyId: 0,
        policyIssueId: 0,
        effectiveDate: "string",
        reviewDate: "string",
        policyIssueStatusId: 0,
        isSelectAll: false,
        policyNumber: "string",
        friendlyName: "string",
        body: "string",
        policyFilePath: "string",
        assignmentUserIds: [
            0
        ],
        policyAssessments: [
            {
                policyAssessmentId: 0,
                policyIssueId: 0,
                isActive: true,
                policyAssessmentQuestions: [
                    {
                        policyAssessmentQuestionId: 0,
                        policyAssessmentId: 0,
                        questionBody: "string",
                        pointsAvailable: 0,
                        isActive: true,
                        policyAssessmentAnswers: [
                            {
                                policyAssessmentAnswerId: 0,
                                policyAssessmentQuestionId: 0,
                                answerBody: "string",
                                isCorrect: true,
                                isActive: true
                            }
                        ]
                    }
                ]
            }
        ]
    };

     // #region Export Variables
    
     public policiesAssignmentTableDataSource = new MatTableDataSource<
        PoliciesAssignments
    >();
     public policiesSignature_ColumnDefinitionsForExport: MatTableDefinitionForExport[];
     public ExportType = SharedConstant.ExportType;
     
     // #endregion

    constructor(
        public policiesManagementService: PoliciesManagementService,
        private _loadingService: IonicLoadingService,
        private _formBuilder: UntypedFormBuilder,
        private _addNewPolicyFactory: PolicyManagement_AddPolicyDialog_Factory,
        private _showPolicyAssesmentFactory: PolicyManagement_AddPolicyAssesmentDialog_Factory,
        private _showAssignUsersTableFactory: PolicyManagement_UserSelectTableDialog_Factory,
        private _archiveNewPoliciesFactory: Policies_ArchivePoliciesDialog_Factory,
        private _auditLogDialogFactory: Policies_AuditLogDialog_Factory,
        private _toastService: ToastService,
        private _alertController: AlertController,
        private _pdfExportService: PoliciesPDFExportService
    ) { }

    public onChange({ editor }: ChangeEvent) {
        const data = editor.getData();
        this.policiesDetail.body = data;
    }

    public showAssesmentButtonClick() {

        if (this.policiesDetail.policyAssessments == null) {
            this.policiesDetail.policyAssessments = [];
        }

        let isNew: boolean = false;

        if (this.policiesDetail.policyAssessments.length == 0) {
            isNew = true;
        }

        this._showPolicyAssesmentFactory.openDialog(this.policiesDetail.policyAssessments[0] || null, isNew, true).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                if (result.record) {
                    this.policiesDetail.policyAssessments[0] = result.record;
                } else {
                    this.policiesDetail.policyAssessments = [];
                }

            }
        });
    }

    public showAssignedUsersTable() {
        this._showAssignUsersTableFactory.openDialog(this.assignmentUserIds, this.policiesDetail.isSelectAll).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                this.assignmentUserIds = result.record;
                this.policiesUpdateInfo.assignmentUserIds = result.record;
            }
        });

    }
    /**
     * [onExpirationDateChanged] triggers when the expiration date is changed, to reset the IsExpired flag, if needed.
     */
    public onExpirationDateChanged(policies: PoliciesInfo) {
        console.log('onExpirationDateChanged...');
        // policies.IsExpired = policies.ExpirationDate < new Date();
    }

    /**
     * [onPoliciesUploaded] triggers when a policies file is uploaded
     */
    public onPoliciesUploaded(fileUploadPath: string) {
        // set the upload path to the uploaded file path
        this.policiesInfo.policyFilePath = fileUploadPath;
        this.policiesInfo.isRemoveAttachment = false;
    }

    /**
     * [onClearPoliciesUploadBtn] clears the currently stored cloudpath for the policies upload
     */
    public onClearPoliciesUploadBtn() {
        // clear the upload path for the policies
        this.policiesInfo.policyFilePath = "";
        this.policiesInfo.isRemoveAttachment = true;
    }

    public onViewPoliciesUploadBtn(policiesInfo: PoliciesInfo) {
        this._viewPoliciesFile(policiesInfo);
    }

    /**
     * [onSaveBtnClick] handles the event of the 'Save' button being clicked in the edit view
     */
    public onSaveBtnClick() {
        this._updatePoliciesInfo()
            .then(res => {
                if (res == ECrudActions.update) {
                    this.onPoliciesUpdated.emit({ data: null, action: ECrudActions.update });
                    // this.onPoliciesUpdated.emit({data: this.policiesDetail, action: ECrudActions.update});
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

    /**
     * [onReissueBtnClick] handles the event of the 'Save' button being clicked in the edit view
     */
    public onReissueBtnClick() {
        this._addNewPolicyFactory.openDialogReissue(this.policiesDetail, true).afterClosed().subscribe(result => {
            if (result && result.isRenewed) {
                this.onPoliciesUpdated.emit({ data: null, action: ECrudActions.reIssue });
            }
        });
    }


    /**
     * [onArchiveBtnClick] handles the event of the 'Archive' button being clicked in the edit view
     */
    public onArchiveBtnClick() {
        this._archiveNewPoliciesFactory.openDialog(this.policiesInfo).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                // mark the policies as "Archived"
                this.policiesInfo.isDeleted = true;
                this._loadingService.presentLoading("Saving policy...");
                location.reload();
            }
        });
    }

    public onViewAuditLogBtnClick() {
        this._presentAuditLogDialog();
    }

    public updateData(data: any): void {

        if (!this.policiesDetail.policyFilePath) {   //first case when no file attached
            if (this.policiesInfo.policyFilePath != undefined) {
                if (this.policiesInfo.policyFilePath.hasOwnProperty('relativePath')) {
                    this.policiesDetail.policyFilePath = this.policiesInfo.policyFilePath["relativePath"];
                }
            }
        } else {
            if ('isRemoveAttachment' in this.policiesInfo) {
                if (this.policiesInfo.policyFilePath && this.policiesInfo.isRemoveAttachment == false) { //add Attachment Case 
                    if (this.policiesInfo.policyFilePath.hasOwnProperty('relativePath')) {
                        this.policiesDetail.policyFilePath = this.policiesInfo.policyFilePath["relativePath"];
                    }
                } else if (this.policiesInfo.isRemoveAttachment) {
                    this.policiesDetail.policyFilePath = "";
                }
            }
        }

        if (!this.policiesDetail.policyFilePath) {
            this.policiesDetail.policyFilePath = "";
        }

        this.policiesUpdateInfo.policyNumber = this.updatePolicyFormControls.policyNumber.value;
        this.policiesUpdateInfo.friendlyName = this.updatePolicyFormControls.friendlyName.value
        this.policiesUpdateInfo.effectiveDate = this.updatePolicyFormControls.effectiveDate.value;
        this.policiesUpdateInfo.reviewDate = this.updatePolicyFormControls.reviewDate.value;


        this.policiesUpdateInfo.policyId = this.policiesDetail.policyId;
        this.policiesUpdateInfo.policyIssueId = this.policiesDetail.policyIssueId;
        this.policiesUpdateInfo.isSelectAll = this.policiesDetail.isSelectAll;
        this.policiesUpdateInfo.policyIssueStatusId = this.policiesDetail.policyStatusId;
        this.policiesUpdateInfo.body = this.policiesDetail.body;
        this.policiesUpdateInfo.policyFilePath = this.policiesDetail.policyFilePath;


        if (Object.keys(this.policiesDetail.policyAssessments).length === 0) {
            delete this.policiesUpdateInfo["policyAssessments"];
        } else {
            this.policiesUpdateInfo.policyAssessments[0].policyAssessmentId = this.policiesDetail.policyAssessments[0].policyAssessmentId;
            this.policiesUpdateInfo.policyAssessments[0].policyIssueId = this.policiesDetail.policyIssueId;
            this.policiesUpdateInfo.policyAssessments[0].isActive = this.policiesDetail.policyAssessments[0].isActive;

            this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions = this.policiesDetail.policyAssessments[0].policyAssessmentQuestions;
            var i = 0;
            if (this.policiesDetail.policyAssessments.length == 1 || this.policiesDetail.policyAssessments[0].policyAssessmentQuestions.length > 0) {
                this.policiesDetail.policyAssessments[0].policyAssessmentQuestions.forEach(element => {
                    var j = 0;
                    this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].policyAssessmentQuestionId = element.policyAssessmentQuestionId;
                    this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].policyAssessmentId = element.policyAssessmentId;
                    this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].questionBody = element.questionBody;
                    this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].pointsAvailable = element.pointsAvailable;
                    this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].isActive = element.isActive;
                    delete this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i]["isDeleted"];
                    if ('policyAssessmentAnswers' in element && element.policyAssessmentAnswers.length) {
                        element.policyAssessmentAnswers.forEach(answer => {
                            this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].policyAssessmentAnswers[j].policyAssessmentAnswerId = answer.policyAssessmentAnswerId;
                            this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].policyAssessmentAnswers[j].policyAssessmentQuestionId = answer.policyAssessmentQuestionId;
                            this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].policyAssessmentAnswers[j].answerBody = answer.answerBody;
                            this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].policyAssessmentAnswers[j].isCorrect = answer.isCorrect;
                            this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].policyAssessmentAnswers[j].isActive = answer.isActive;
                            delete this.policiesUpdateInfo.policyAssessments[0].policyAssessmentQuestions[i].policyAssessmentAnswers[j]["isDeleted"];
                            j++;
                        });
                    }
                    i++;
                });
            }
            else {
                delete this.policiesUpdateInfo.policyAssessments[0];
                this.policiesUpdateInfo.policyAssessments = null;
            }
        }
    }

    /**
     * [_updatePoliciesInfo] issues the [addPolicy] API call then emits the
     * passed in event to the parent component
     */
    private _updatePoliciesInfo() {
        return new Promise((resolve, reject) => {
            this.policiesUpdateInfo.assignmentUserIds = this.assignmentUserIds;
            this._loadingService.presentLoading("Saving policy...");
            this.updateData(this.policiesDetail);
            console.log("check dfte", this.policiesUpdateInfo);
            this.policiesManagementService.updatePolicy(this.policiesUpdateInfo).subscribe((data: PoliciesDetailInfo) => {
                this._loadingService.dismissLoading();
                this._toastService.presentToast("Policy Updated.");
                resolve(ECrudActions.update);

            },
                (error: APIResponseError) => {
                    console.log('policies-error: ', error);
                    this.initialized = true;
                    this._loadingService.dismissLoading();
                    reject(error);
                }
            );
        })
    }

    /**
     * [_viewPoliciesFile] opens the given policies cloudpath
     * if one exists
     */
    private _viewPoliciesFile(policiesInfo: PoliciesInfo) {
        // if there is a cloudpath, open a new tab for the link
        if (policiesInfo.policyFilePath) {
            window.open(policiesInfo.policyFilePath, '_blank');
        } else {
            this._alertController.create({
                message: "This policy does not have an uploaded file.",
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

    private async _getPolicyDetails(): Promise<void> {
        const policyStatusID = 1;
        return new Promise((resolve, reject) => {
            this.policiesManagementService.getPolicyDetails(this.policiesInfo.policyId, policyStatusID).subscribe(
                (policies) => {
                    this.policiesDetail = policies[0] as PoliciesInfo;

                    this.policiesDetail.policyAssignments.forEach(element => {
                        this.assignmentUserIds.push(element.userId);
                    });

                    resolve();
                },
                (error) => {
                    console.error('policies-error: ', error);
                    reject();
                });
        });
    }

    private _presentAuditLogDialog() {
        this._auditLogDialogFactory.openDialog(this.policiesInfo).afterClosed().subscribe(result => {

        });
    }

    private _init() {
        if (this.policiesInfo && this.initFrom != 'admin') {
            this.policiesDetail = this.policiesInfo;
            this.intialzeForm();
        } else {
            this._getPolicyDetails().then(() => {
                this.intialzeForm();
            });
        }

        // Disable for revision
        if (this.initFrom != 'admin') {
            this.updatePolicyForm.disable();
        }

        this.initialized = true;
    }

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

    intialzeForm() {
        this.updatePolicyForm.patchValue({
            description: this.policiesDetail.body,
            policyNumber: this.policiesDetail.policyNumber,
            friendlyName: this.policiesDetail.friendlyName,
            effectiveDate: this.policiesDetail.effectiveDate,
            reviewDate: this.policiesDetail.reviewDate
        });
       
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
            customTitleText: 'Policy',
            showFileUploadedCard: true,
            preExistingFileUpload: this.policiesDetail.policyFilePath
        };
    }

    public handlePoliciesSignatureUpdate(payload: TPoliciesCB<Array<number>>): void {
        if (payload.action && payload.action == ECrudActions.remove) {
            if (payload.data) {
                if (payload.data && this.assignmentUserIds && payload.data.length < this.assignmentUserIds.length) {
                    this.assignmentUserIds = payload.data;
                    this.policiesDetail.isSelectAll = false;
                }
            }
        }
    }

    onEffectiveDateChanged(eventData: any) {
        if (eventData.value) {
            this.updatePolicyForm.controls['reviewDate'].setValue(moment(eventData.value).add(1, 'year').format());
        }
    }

    get updatePolicyFormControls() { return this.updatePolicyForm.controls; }

    //#region
    public onClickExport(type:string): void {

        this.setExportColumnDefinitionAndDataSource();
        
        switch(type)
        {
            case this.ExportType.Pdf :
                this._pdfExportService
                .exportMatTableToPDF(
                'Policies Signature Export'
                , this.policiesSignature_ColumnDefinitionsForExport
                , this.policiesAssignmentTableDataSource );
                break;
            
            case this.ExportType.Csv :
                this._pdfExportService
                .exportMatTableToCSV(
                'Policies Signature Export'
                , this.policiesSignature_ColumnDefinitionsForExport
                , this.policiesAssignmentTableDataSource );
                break;

            default:
                break;

        }
    }

    setExportColumnDefinitionAndDataSource():void
    {
        this.policiesAssignmentTableDataSource = new MatTableDataSource(
            this.policiesDetail.policyAssignments
        );
        // Defining the columns with some export related properties
        this.policiesSignature_ColumnDefinitionsForExport = [
            {
                FriendlyName: 'IDNumber',
                TechnicalName: 'userId',
                HideForPrint: false,
                Datatype: 'number',
                Width: 100
            },
            {
                FriendlyName: 'Username',
                TechnicalName: 'assigneeName',
                HideForPrint: false,
                Datatype: 'string',
                Width: 200
            },
            {
                FriendlyName: 'Status',
                TechnicalName: 'isAcknowledged',
                HideForPrint: false,
                Datatype: 'boolean',
                Width: 50
            },
            {
                FriendlyName: 'Acknowledged Date',
                TechnicalName: 'dateAcknowledged',
                HideForPrint: false,
                Datatype: 'date-string',
                Width: 120
            },
            {
                FriendlyName: 'Reminder',
                TechnicalName: '',
                HideForPrint: true,
                Datatype: '',
                Width: 100
            },
            {
                FriendlyName: 'DeleteSignature',
                TechnicalName: '',
                HideForPrint: true,
                Datatype: '',
                Width: 100
            }
        ];
    }
    //#endregion
}