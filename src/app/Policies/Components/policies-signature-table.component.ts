import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
} from "@angular/core";
import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
    ReactiveFormsModule,
} from "@angular/forms";
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from "src/app/shared/FormFieldValidators/error-messages.service";
import {
    PoliciesInfo,
    PoliciesAssignments,
    ResetPolicy,
} from "../Providers/policies.model";
import { PoliciesManagementService } from "../Providers/policies.service";
import { PolicyManagement_SendReminderDialog_Factory } from "src/app/Policies/Components/Dialogs/policy-signature-reminder.dialog";
import { APIResponseError } from "src/app/shared/API.Response.Model";
import { API_URLS } from "src/environments/environment";
import { ToastService } from "src/app/shared/Toast.Service";
import { IonicLoadingService } from "src/app/shared/Ionic.Loading.Service";
import { FileUploadComponentInput } from "src/app/shared/Components/FileUpload/file-upload.component";
import { MatTableDataSource } from "@angular/material/table";
import { AlertController } from "@ionic/angular";
import { GenericFilterPipe } from "src/app/shared/generic-filter-pipe";
import { ECrudActions, TPoliciesCB } from "../model/t-polices-actions";
import { MatPaginator } from "@angular/material/paginator";
import { SharedConstant } from "src/app/shared/models/Shared.Constant";

@Component({
    selector: "policies-signature-table",
    templateUrl: "policies-signature-table.component.html",
    styleUrls: ["../policies.page.scss"],
})
export class PoliciesSignatureTable_Component implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public policiesManagementService: PoliciesManagementService,
        private _sendReminderPolicyFactory: PolicyManagement_SendReminderDialog_Factory,
        private _loadingService: IonicLoadingService,
        private _toastService: ToastService,
        private _filterPipe: GenericFilterPipe,
        private _alertController: AlertController
    ) { }

    @Input() policiesInfo: PoliciesInfo;
    @Input() initFrom: string = "admin";

    @Input() policiesAssignments: Array<any>;
    @Input() policiesAssessments: Array<any>;
    @Output() onDataUpdate: EventEmitter<
        TPoliciesCB<Array<any>>
    > = new EventEmitter();

    public policiesAssignmentData: PoliciesAssignments[];
    public resetPolicy: ResetPolicy[] = [
        {
            userId: 0,
            policyIssueId: 0,
            assessmentId: 0,
        },
    ];

    public initialized: boolean = false;
    public assessmentReseted: boolean = false;
    public policiesAssignmentTableDataSource = new MatTableDataSource<
        PoliciesAssignments
    >();
    public policiesAssignmentTable_matTable_displayedColumns: string[] = [
        "IDNumber",
        "Username",
        "Status",
        "DateAcknowledged",
        "Reminder",
        "DeleteSignature",
    ];

    // #region Paginator Variables

    @ViewChild(MatPaginator) signaturePaginator: MatPaginator;
    public PaginatorOptions = SharedConstant.PaginatorOptions;

    // #endregion

    public resetBtnClick(userID: Number, assigneeName: string) {
        this.resetPolicy[0].userId = userID;
        this.resetPolicy[0].policyIssueId = this.policiesAssessments[0].policyIssueId;
        this.resetPolicy[0].assessmentId = this.policiesAssessments[0].policyAssessmentId;
        this._loadingService.presentLoading("Reseting policy...");

        this.policiesManagementService.resetPolicy(this.resetPolicy[0]).subscribe(
            (Response) => {
                this.assessmentReseted = true;
                this._toastService.presentToast("Assessment Reset for " + assigneeName);
                this._loadingService.dismissLoading();
            },
            (error: APIResponseError) => {
                console.log("policies-error: ", error);
                this.initialized = true;
                this._loadingService.dismissLoading();
            }
        );
    }

    private getSignaturesData() {
        
        this.policiesAssignmentData = this.policiesAssignments as PoliciesAssignments[];
        this.policiesAssignmentTableDataSource = new MatTableDataSource(
            this.policiesAssignmentData
        );
        this.initialized = true;
        
    }

    public reminderButtonClick(policy: any) {
        let payload = { ...policy, ...this.policiesInfo };
        if (policy && policy.userId) {
            this._sendReminderPolicyFactory
                .openDialog(payload)
                .afterClosed()
                .subscribe((result) => {
                    if (result && result.confirmed) {
                        console.log("result check dialog", result);
                    }
                });
        } else {
            this._toastService.presentToast("No Policy or User Id present.");
        }
    }

    ngOnInit() {
        this.initialized = false;

        if (this.initFrom != "admin") {
            this.policiesAssignmentTable_matTable_displayedColumns = [
                "IDNumber",
                "Username",
                "Status",
            ];
        }

        this.getSignaturesData();
    }

    public deleteSignature(policyId) {
       
        this.policiesAssignmentData = this.policiesAssignmentData.filter(
            (u) => u.id !== policyId
        );
        let assignmentUserIds = this.policiesAssignmentData.map((el) => {
            return el.userId;
        });

        this.onDataUpdate.emit({
            data: assignmentUserIds,
            action: ECrudActions.remove,
        });

        this.setSignatureDataSourceAndPaginator();
    }

    ngAfterViewInit() {
        // Added for the ViewChild binding
         this.policiesAssignmentTableDataSource.paginator = this.signaturePaginator;
    }

    setSignatureDataSourceAndPaginator()
    {
        this.policiesAssignmentTableDataSource = new MatTableDataSource(
            this.policiesAssignmentData
        );

       this.policiesAssignmentTableDataSource.paginator = this.signaturePaginator;
    }
}
