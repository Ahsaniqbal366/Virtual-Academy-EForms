import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ExternalTrainingService } from 'src/app/ExternalTraining/Providers/external-training.service';

import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { ExternalTrainingServerInfo, CreditTypeInfo, ExternalCreditCourseInfo, ExternalCreditInfo } from '../../Providers/external-training.model';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { MaterialLoadingService } from 'src/app/shared/Material.Loading.Service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { Router } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';

// define component
@Component({
    selector: 'add-external-training-component',
    templateUrl: 'add-external-training.component.html',
    styleUrls: ['../../external-training.page.scss']
})

// create class for export
export class AddExternalTraining_Component implements OnInit, AfterViewInit {

    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public externalTrainingService: ExternalTrainingService,
        private _router: Router,
        private _navController: NavController,
        private _toastService: ToastService,
        private _alertController: AlertController,
        private _materialLoadingService: MaterialLoadingService,
        private _formBuilder: FormBuilder,
        private _formFieldValidate_errorMessagesService: FormFieldValidate_ErrorMessagesService) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;

    public fileUploadInput: FileUploadComponentInput;

    public externalTrainingInfo: ExternalCreditCourseInfo;
    public selectedUsers: UserInfo[];

    // form variables
    public addCourseForm = this._formBuilder.group({
        Name: ['', [Validators.required]],
        CreditType: ['', [Validators.required]],
        Hours: ['', []],
        SME: ['', []],
        StartDate: ['', [Validators.required]],
        EndDate: ['', [Validators.required]],
        AdditionalDetails: ['', []],
        AdditionalDetailsUpload: ['', []]

    });


    /*******************************************
    * PUBLIC METHODS
    *******************************************/
    /**
     * [getFieldErrorMessage] formats the error message to display on the input field
     */
    public getFieldErrorMessage(field: AbstractControl): string {
        return this._formFieldValidate_errorMessagesService.getFieldErrorMessage(field);
    }

    public onUserSelectionChanged($event: any) {
        this.selectedUsers = $event;


    }

    /**
    * [onAdditionalDetailsUploaded] triggers when a additional details file is uploaded
    */
    public onAdditionalDetailsUploaded(fileUploadPath: string) {
        // set the upload path to the uploaded file path
        this.externalTrainingInfo.AdditionalDetailsUploadPath = fileUploadPath;
    }

    /**
     * [onClearAdditionalDetailsUploadBtn] clears the currently stored cloudpath for the additional details upload
     */
    public onClearAdditionalDetailsUploadBtn() {
        // clear the upload path for the externalTraining
        this.externalTrainingInfo.AdditionalDetailsUploadPath = "";
    }

    public onSubmitBtnClick() {
        // verify that the form is valid
        if (this.addCourseForm.valid && this.selectedUsers.length > 0) {
            // map the form data to a [externalTrainingInfo] object
            this._getFormInfo();

            // submit the form
            this._submitForm();
        } else {
            this._toastService.presentToast('Please correct any validation errors and try again.');
        }
    }

    /**
     * [onBackBtnClick] handles the Back button click event
     */
    public onBackBtnClick(){
        this._alertController.create({
            header: 'Leave page',
            message: 'Are you sure you want to leave the page?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        let baseUrl = this._router.url;
                        baseUrl = this._router.url.split('/add-new-course')[0];
                        this._navController.navigateRoot(baseUrl);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
       
    }

    /*******************************************
    * PRIVATE METHODS
    *******************************************/
    /**
     * [_getFormInfo] maps the form data to the data object being updated
     */
    private _getFormInfo() {
        var startDate = new Date(this.addCourseForm.get("StartDate").value);
        var endDate = new Date(this.addCourseForm.get("EndDate").value)
        
        this.externalTrainingInfo.Name = this.addCourseForm.get("Name").value;
        this.externalTrainingInfo.CreditTypeID = +this.addCourseForm.get("CreditType").value;
        this.externalTrainingInfo.Hours = +this.addCourseForm.get("Hours").value;
        this.externalTrainingInfo.SME = this.addCourseForm.get("SME").value;
        this.externalTrainingInfo.StartDate = startDate;
        this.externalTrainingInfo.EndDate = endDate;
        this.externalTrainingInfo.AdditionalDetails = this.addCourseForm.get("AdditionalDetails").value;

        this.externalTrainingInfo.CreatedOnDate = new Date();
        this.externalTrainingInfo.CourseTypeID = 1;

        this._buildCourseRosterInfo();

    }

    /**
     * [_buildCourseRosterInfo] gathers data from the course input form and the <user-table-selector> component
     * to attach user data to the course
     */
    private _buildCourseRosterInfo(){
        this.externalTrainingInfo.CourseCreditInfo = [];

        this.selectedUsers.forEach(user => {
            var StartDate = new Date(this.addCourseForm.get("StartDate").value);
            var EndDate = new Date(this.addCourseForm.get("EndDate").value);
            
            var credit = new ExternalCreditInfo();
            credit.CourseID = this.externalTrainingInfo.ExternalCreditCourseID;
            credit.HoursCompleted = +this.addCourseForm.get("Hours").value;
            credit.StartDate = StartDate;
            credit.EndDate = EndDate;
            credit.UserID = user.UserID;
            credit.IsDeleted = false;

            this.externalTrainingInfo.CourseCreditInfo.push(credit);
        });
    }

    /**
     * [_submitForm] submits the [ExternalTrainingCourse] object to the DB
     */
    private _submitForm() {
        this._materialLoadingService.presentLoading("Submitting course...");

        this.externalTrainingService.updateExternalTrainingRoster(this.externalTrainingInfo).subscribe((data: ExternalCreditCourseInfo) => {
            this._materialLoadingService.dismissLoading();

            let baseUrl = this._router.url;
            baseUrl = this._router.url.split('/add-new-course')[0];
            this._navController.navigateRoot(baseUrl);
        },
            (error: APIResponseError) => {
                console.error('externaltraining-error: ', error);
                this.initialized = true;
                this._materialLoadingService.dismissLoading();
            }
        );
    }

    /*******************************************
    * SELF INIT
    *******************************************/

    private _init() {
        this.initialized = false;

        this.externalTrainingInfo = new ExternalCreditCourseInfo();

        // initialize the file upload input for the Additional Info/Course description data
        this.fileUploadInput = {
            SelectedTab: "File",
            AvailableTabs: ["File"],
            FileUploadConfig: {
                autoSubmit: true,
                maxFileSize_MB: 50,
                apiRoot: API_URLS.Core,
                apiCallMethod: 'externaltraining/uploadCourseDescription',
                validFileTypes: ['png', 'jpg', 'pdf'],
                additionalParameters: {

                }
            },
            showInstructions: false,
            useCustomTitle: true,
            customTitleText: 'Additional Info',
            showFileUploadedCard: true,
            preExistingFileUpload: this.externalTrainingInfo.AdditionalDetailsUploadPath
        };

        // initialize component data
        this.externalTrainingService.getServerInfo().subscribe(
            (serverInfo: any) => {
                this.externalTrainingService.serverInfo = new ExternalTrainingServerInfo(serverInfo);
                this.externalTrainingService.externalTrainingTypes = serverInfo.ExternalTrainingTypes as CreditTypeInfo[];

                this.initialized = true;

            },
            (error) => {
                console.error('externaltraining-error: ', error);
                this.initialized = true;
            }
        );
    }



    ngOnInit() {
        this._init();
    }

    ngAfterViewInit() {
    }
}