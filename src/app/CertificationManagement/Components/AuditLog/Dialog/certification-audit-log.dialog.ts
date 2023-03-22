import { Component, OnInit, Input, Injectable, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { CertificationTypeInfo, CertificationInfo, CertificationAuditLogInfo } from '../../../Providers/certification-management.model';
import { CertificationManagementService } from '../../../Providers/certification-management.service';
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
    selector: 'certification-audit-log-dialog',
    templateUrl: 'certification-audit-log.dialog.html',
    styleUrls: [
        '../../../certification-management.page.scss'
    ]
})

export class CertificationManagement_AuditLogDialog_Component implements OnInit {

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private _materialLoadingService: MaterialLoadingService,
        public certificationManagementService: CertificationManagementService,
        private _certificationManagement_AuditLogDialog_Factory: CertificationManagement_AuditLogDialog_Factory,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
    }

    /**
     * PUBLIC  VARIABLES
     */

    public certificationAuditLogInfo: CertificationAuditLogInfo[];

    public certificationAuditLogDataSource = new MatTableDataSource<CertificationAuditLogInfo>();
    public certificationAuditLog_matTable_displayedColumns: string[] = [
        'DateUpdated', 'UpdatedBy', 'Title', 'TypeName', 'TrainingHours', 'CompletionDate', 'ExpirationDate', 'CloudPath', 'IsArchived'
    ];

    @ViewChild(MatPaginator) certificationAuditLogTablePaginator: MatPaginator;

    /**
     * START: Data passed in thru [_dialogData].
     * Unpacked on _init.
     */

    // dialog input variables
    public certificationInfo: CertificationInfo;



    /** END: Data passed in thru [_dialogData] */

    public initialized: boolean;



    /**
     * PRIVATE VARIABLES
     */

    /**
     * PUBLIC METHODS
     */

    public closeDialog(): void {
        this._certificationManagement_AuditLogDialog_Factory.closeDialog(false, null);
    }

    /**
     * [onOpenCertificationUploadBtn] opens the given certification's cloudpath
     * if one exists
     */
    public onOpenCertificationUploadBtn(cloudpath: string) {
        // if there is a cloudpath, open a new tab for the link
        if (cloudpath) {
            window.open(cloudpath, '_blank');
        }
    }

    /**
     * PRIVATE METHODS
     */

    /**
     * [_buildAuditLog] sets up the [certificationAuditLogDataSource] object with formatted
     * audit log data. The modification data for each change is deserialzed and sorted to allow
     * the user to view the changesets in a readable format.
     * 
     * If the dialog was opened in the 'View Changes' mode, the [LastReviewedDate] and [HasUnreviewedChanges] 
     * triggers will be updated as well.
     */
    private _buildAuditLog(auditLogData: CertificationAuditLogInfo[]) {
        // assign the data object 
        this.certificationAuditLogInfo = auditLogData;

        // iterate over each record in [certificationAuditLogInfo] to deseralize the modified data into a more structured format
        this.certificationAuditLogInfo.forEach((loopedAuditLogRecord, index) => {
            // deserialize the modification data into a [CertificationInfo] object
            loopedAuditLogRecord.DeserializedModification = SerializationHelper.toInstance(new CertificationInfo(), loopedAuditLogRecord.Modification)[0];

            // assign the [CertificationType] data in order to display some "friendly name" information
            let modificationTypeID = loopedAuditLogRecord.DeserializedModification.TypeID;
            loopedAuditLogRecord.DeserializedModification.TypeInfo = this.certificationManagementService.certificationTypes.filter(type => type.CertificationTypeID == modificationTypeID)[0];

            // as long as the record isn't the initial creation record, assign the [PreviousModification] object to the audit log record
            if (index > 0) {
                loopedAuditLogRecord.PreviousModification = this.certificationAuditLogInfo[index - 1];
            }
        });

        // sort the audit log info descendingly by the audit log creation date
        this.certificationAuditLogInfo.sort((a: CertificationAuditLogInfo, b: CertificationAuditLogInfo) => {
            return +new Date(b.EntryDate) - +new Date(a.EntryDate);
        });

        // assign the data source and paginator
        this.certificationAuditLogDataSource.data = this.certificationAuditLogInfo;
        this.certificationAuditLogDataSource.paginator = this.certificationAuditLogTablePaginator;

        // if the page is in change review mode, trigger the DB to update the review status of the certification
        if (this.certificationManagementService.isReviewingCertificationChanges) {

            this.certificationManagementService.updateCertificationReviewStatus(this.certificationInfo).subscribe((data: CertificationAuditLogInfo[]) => {
            });
        }
    }


    private _init() {
        this.initialized = false;

        this.certificationInfo = this._dialogData.certificationInfo;

        // get all audit log data for the given [CertificationInfo] object
        this.certificationManagementService.getAuditLogForCertification(this.certificationInfo).subscribe((data: CertificationAuditLogInfo[]) => {
            // setup the audit log table data
            this._buildAuditLog(data);

            this.initialized = true;
        },
            (error: APIResponseError) => {
                console.log('certifications-error: ', error);
                this.initialized = true;

            }
        );
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
export class CertificationManagement_AuditLogDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<CertificationManagement_AuditLogDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(certificationInfo: CertificationInfo)
        : MatDialogRef<CertificationManagement_AuditLogDialog_Component> {

        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(certificationInfo);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(certificationInfo);
        }

        return this._matDialogRef;
    }

    private _openDialog(certificationInfo: CertificationInfo) {
        this._matDialogRef = this.matDialog.open(CertificationManagement_AuditLogDialog_Component, {
            data: {
                certificationInfo: certificationInfo
            },
            maxWidth: '700px',
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