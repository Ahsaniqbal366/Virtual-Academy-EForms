import { Component, OnInit, Input, Injectable, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { PoliciesInfo, PoliciesAuditLogInfo } from '../../../Providers/policies.model';
import { PoliciesManagementService } from '../../../Providers/policies.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { MaterialLoadingService } from 'src/app/shared/Material.Loading.Service';
import { Observable, Subject, of } from 'rxjs';
import { startWith, map, delay } from 'rxjs/operators';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';


// define component
@Component({
    selector: 'policies-audit-log-dialog',
    templateUrl: 'policies-audit-log.dialog.html',
    styleUrls: [
        '../../../policies.page.scss'
    ]
})

export class Policies_AuditLogDialog_Component implements OnInit {

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private _materialLoadingService: MaterialLoadingService,
        public policiesManagementService: PoliciesManagementService,
        private _policies_AuditLogDialog_Factory: Policies_AuditLogDialog_Factory,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
    }

    /**
     * PUBLIC  VARIABLES
     */

    public policiesAuditLogInfo: PoliciesAuditLogInfo[];

    public policiesAuditLogDataSource = new MatTableDataSource<PoliciesAuditLogInfo>();
    public policiesAuditLog_matTable_displayedColumns: string[] = [
        'DateUpdated', 'UpdatedBy', 'PolicyTitle', 'Policy Number', 'CompletionDate', 'ExpirationDate', 'CloudPath', 'IsArchived'
    ];

    @ViewChild(MatPaginator) policiesAuditLogTablePaginator: MatPaginator;

    /**
     * START: Data passed in thru [_dialogData].
     * Unpacked on _init.
     */

    // dialog input variables
    public policiesInfo: PoliciesInfo;



    /** END: Data passed in thru [_dialogData] */

    public initialized: boolean;



    /**
     * PRIVATE VARIABLES
     */

    /**
     * PUBLIC METHODS
     */

    public closeDialog(): void {
        this._policies_AuditLogDialog_Factory.closeDialog(false, null);
    }

    /**
     * [onOpenPoliciesUploadBtn] opens the given policy's cloudpath
     * if one exists
     */
    public onOpenPoliciesUploadBtn(cloudpath: string) {
        // if there is a cloudpath, open a new tab for the link
        if (cloudpath) {
            window.open(cloudpath, '_blank');
        }
    }

    /**
     * PRIVATE METHODS
     */

    /**
     * [_buildAuditLog] sets up the [policiesAuditLogDataSource] object with formatted
     * audit log data. The modification data for each change is deserialzed and sorted to allow
     * the user to view the changesets in a readable format.
     * 
     * If the dialog was opened in the 'View Changes' mode, the [LastReviewedDate] and [HasUnreviewedChanges] 
     * triggers will be updated as well.
     */
    private _buildAuditLog(auditLogData: PoliciesAuditLogInfo[]) {
        // assign the data object 
        this.policiesAuditLogInfo = auditLogData;

        // iterate over each record in [policiesAuditLogInfo] to deseralize the modified data into a more structured format
        this.policiesAuditLogInfo.forEach((loopedAuditLogRecord, index) => {
            // deserialize the modification data into a [PoliciesInfo] object
            loopedAuditLogRecord.DeserializedModification = SerializationHelper.toInstance(new PoliciesInfo(), loopedAuditLogRecord.Modification)[0];

            // assign the [PoliciesType] data in order to display some "friendly name" information
            // let modificationTypeID = loopedAuditLogRecord.DeserializedModification.TypeID;
            // loopedAuditLogRecord.DeserializedModification.TypeInfo = this.policiesManagementService.policiesTypes.filter(type => type.PoliciesTypeID == modificationTypeID)[0];

            // as long as the record isn't the initial creation record, assign the [PreviousModification] object to the audit log record
            if (index > 0) {
                loopedAuditLogRecord.PreviousModification = this.policiesAuditLogInfo[index - 1];
            }
        });

        // sort the audit log info descendingly by the audit log creation date
        this.policiesAuditLogInfo.sort((a: PoliciesAuditLogInfo, b: PoliciesAuditLogInfo) => {
            return +new Date(b.EntryDate) - +new Date(a.EntryDate);
        });

        // assign the data source and paginator
        this.policiesAuditLogDataSource.data = this.policiesAuditLogInfo;
        this.policiesAuditLogDataSource.paginator = this.policiesAuditLogTablePaginator;

        // if the page is in change review mode, trigger the DB to update the review status of the policy
        // if (this.policiesManagementService.isReviewingPoliciesChanges) {

        //     this.policiesManagementService.addPolicyReviewStatus(this.policiesInfo).subscribe((data: PoliciesAuditLogInfo[]) => {
        //     });
        // }
    }


    private _init() {
        this.initialized = false;

        this.policiesInfo = this._dialogData.policiesInfo;

        // get all audit log data for the given [PoliciesInfo] object
        // this.policiesManagementService.getAuditLogForPolicies(this.policiesInfo).subscribe((data: PoliciesAuditLogInfo[]) => {
        //     // setup the audit log table data
        //     this._buildAuditLog(data);

        //     this.initialized = true;
        // },
        //     (error: APIResponseError) => {
        //         console.log('policies-error: ', error);
        //         this.initialized = true;

        //     }
        // );
    }
    /**
     * SELF INIT
     */
    ngOnInit() {

        this._init();
    }
}

export class SerializationHelper {
    static toInstance<T>(obj: T, json: string): T {
        var jsonObj = JSON.parse(json);

        if (typeof obj["fromJSON"] === "function") {
            obj["fromJSON"](jsonObj);
        }
        else {
            for (var propName in jsonObj) {
                obj[propName] = jsonObj[propName]
            }
        }

        return obj;
    }
}

@Injectable()
export class Policies_AuditLogDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<Policies_AuditLogDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(policiesInfo: PoliciesInfo)
        : MatDialogRef<Policies_AuditLogDialog_Component> {

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
        this._matDialogRef = this.matDialog.open(Policies_AuditLogDialog_Component, {
            data: {
                policiesInfo: policiesInfo
            },
            maxWidth: '700px',
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