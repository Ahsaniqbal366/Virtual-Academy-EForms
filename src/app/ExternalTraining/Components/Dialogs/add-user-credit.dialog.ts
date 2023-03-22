import { Component, OnInit, Input, Injectable, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { CreditTypeInfo, ExternalCreditCourseInfo, ExternalCreditInfo } from '../../Providers/external-training.model';
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
    selector: 'add-user-credit-dialog',
    templateUrl: 'add-user-credit.dialog.html',
    styleUrls: [
        '../../external-training.page.scss'
    ]
})

export class ExternalTraining_AddUserCreditDialog_Component implements OnInit {

    // define service provider and route provider when component is constructed
    constructor(
        private _toastService: ToastService,
        private _materialLoadingService: MaterialLoadingService,
        public externalTrainingService: ExternalTrainingService,
        private _addUserCreditDialog_Factory: ExternalTraining_AddUserCreditDialog_Factory,
        @Inject(MAT_DIALOG_DATA) private _dialogData: any
    ) {
    }

    /**
     * PUBLIC  VARIABLES
     */
    

    /**
     * START: Data passed in thru [_dialogData].
     * Unpacked on _init.
     */

    // dialog input variables
    public courseInfo: ExternalCreditCourseInfo;

    /** END: Data passed in thru [_dialogData] */

    public initialized: boolean;

    public selectedUserIDs: number[];

    public headerText: string;
    public submitBtnText: string;
    public submitMessage: string;

    

    /**
     * PRIVATE VARIABLES
     */

    /**
     * PUBLIC METHODS
     */

     public onUserSelectionChanged($event:any){
        this.selectedUserIDs = $event.map(({ UserID }) => UserID);;

        this._setupExternalCreditList();
     }

    public onSubmitBtnClick(): void{
        this._materialLoadingService.presentLoading("Submitting credit...");

        this.externalTrainingService.updateExternalTrainingRoster(this.courseInfo).subscribe(
            (data: any) => {
                this._toastService.presentToast("Credit submitted successfully");
                this._materialLoadingService.dismissLoading();
                this._addUserCreditDialog_Factory.closeDialog(true, data); 
            },
            (error) => {
                console.error('externaltraining-error: ', error);
                this._materialLoadingService.dismissLoading();
            }
        );
    }

    public closeDialog(): void {
        this._addUserCreditDialog_Factory.closeDialog(false, null);
    }

    
    /**
     * PRIVATE METHODS
     */

     private _setupExternalCreditList(){
        this.courseInfo.CourseCreditInfo = [];

         this.selectedUserIDs.forEach(userID => {
            var credit = new ExternalCreditInfo();
            credit.CourseID = this.courseInfo.ExternalCreditCourseID;
            credit.HoursCompleted = this.courseInfo.Hours;
            credit.StartDate = new Date();
            credit.EndDate = new Date();
            credit.UserID = userID;
            credit.IsDeleted = false;

            this.courseInfo.CourseCreditInfo.push(credit);
        });
     }
   

    
    private _init() {
        this.courseInfo = this._dialogData.courseInfo;

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
export class ExternalTraining_AddUserCreditDialog_Factory {
    constructor(
        private matDialog: MatDialog
    ) { }

    private _matDialogRef: MatDialogRef<ExternalTraining_AddUserCreditDialog_Component>;

    /**
    * PUBLIC METHODS
    */
    public openDialog(courseInfo: ExternalCreditCourseInfo)
        : MatDialogRef<ExternalTraining_AddUserCreditDialog_Component> {

        if (isNullOrUndefined(this._matDialogRef)) {
            this._openDialog(courseInfo);
        }
        else {
            // Close the previous dialog.
            this.closeDialog(false, null);
            // Open the new dialog.
            this._openDialog(courseInfo);
        }

        return this._matDialogRef;
    }

    private _openDialog(courseInfo:ExternalCreditCourseInfo) {
        this._matDialogRef = this.matDialog.open(ExternalTraining_AddUserCreditDialog_Component, {
            data: {
               courseInfo: courseInfo
            },
            maxWidth: '700px',
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