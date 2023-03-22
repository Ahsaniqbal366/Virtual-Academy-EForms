import { Component, OnInit, Input, Injectable, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { CreditTypeInfo, ExternalCreditCourseInfo, ExternalCreditInfo } from '../Providers/external-training.model';
import { ExternalTrainingService } from '../Providers/external-training.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { MatTableDataSource } from '@angular/material/table';
import { AlertController } from '@ionic/angular';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';
import { ExternalTraining_AddUserCreditDialog_Factory } from './Dialogs/add-user-credit.dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { CertificationPDFExportService } from '../Providers/external-training-pdf-export.service';

@Component({
    selector: 'external-training-roster',
    templateUrl: 'external-training-roster.component.html',
    styleUrls: [
        '../external-training.page.scss'

    ]
})

export class ExternalTrainingRoster_Component implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public externalTrainingService: ExternalTrainingService,
        private _filterPipe: GenericFilterPipe,
        private _alertController: AlertController,
        private _addUserCreditFactory: ExternalTraining_AddUserCreditDialog_Factory,
        private _pdfExportService: CertificationPDFExportService
    ) { }

    // course information relevant to the displayed roster
    @Input() courseInfo: ExternalCreditCourseInfo;

    // course roster datasource elements
    public courseRosterDataSource = new MatTableDataSource<ExternalCreditInfo>();
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) externalTrainingCoursesTablePaginator: MatPaginator;
    public courseRoster_matTable_displayedColumns: string[] = [
        'User', 'Role', 'PSID', 'Hours', 'StartDate', 'EndDate', 'RemoveCredit'
    ];

    // Defining the columns with some export related properties
    public externalTrainingCourses_matTable_displayedColumnDefinitionsForExport = [
        {
            FriendlyName: 'User',
            TechnicalName: 'UserInfo.FullName',
            HideForPrint: false,
            Datatype: 'string'
        },
        {
            FriendlyName: 'Role',
            TechnicalName: 'UserInfo.Rank',
            HideForPrint: false,
            Datatype: 'string'
        },
        {
            FriendlyName: 'PSID',
            TechnicalName: 'UserInfo.AcadisID',
            HideForPrint: false,
            Datatype: 'string'
        },
        {
            FriendlyName: 'Hours',
            TechnicalName: 'HoursCompleted',
            HideForPrint: false,
            Datatype: 'string'
        },
        {
            FriendlyName: 'Start Date',
            TechnicalName: 'StartDate',
            HideForPrint: false,
            Datatype: 'date-string'
        },
        {
            FriendlyName: 'End Date',
            TechnicalName: 'EndDate',
            HideForPrint: false,
            Datatype: 'date-string'
        },
        {
            FriendlyName: 'RemoveCredit',
            TechnicalName: '',
            HideForPrint: true,
            Datatype: ''
        }
    ];

    //course roster list
    public unfilteredFormattedClassRoster: ExternalCreditInfo[];

    public initialized: boolean = false;

    public isSearching: boolean = false;
    public searchTextboxInputValue: string;

    /**
     * PUBLIC METHODS
     */

    /**
     * [onRemoveUserClick] handles the remove user click event
     */
    public onRemoveUserClick(creditInfo: ExternalCreditInfo) {
        this._alertController.create({
            header: 'Remove Credit',
            message: "Are you sure you want to remove this user's credit?",
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this._deleteCourseCredit(creditInfo);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    /**
     * [onAddUserBtnClick] handles the "Add User" button click event
     */
    public onAddUserBtnClick() {
        this._addUserCreditFactory.openDialog(this.courseInfo).afterClosed().subscribe(data => {
            if (data.confirmed) {
                this._getCourseRoster();
            }

        });
    }

    /**
     * [onExportClick] handles the 'Export' button click event
     */
    public onExportBtnClick(): void {
        this._pdfExportService.exportMatTableToPDF('Roster for ' + this.courseInfo.Name,
         this.externalTrainingCourses_matTable_displayedColumnDefinitionsForExport, this.courseRosterDataSource);
    }

    /**
     * BEGIN MAT-TABLE SORTING/SEARCHING
     */
    public rosterSortChange(sort: Sort) {
        const data = this.courseRosterDataSource.data.slice();

        if (!sort.active || sort.direction === '') {
            this.courseRosterDataSource.data = data;
            return;
        }

        this.courseRosterDataSource.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'name':
                    return this._filterPipe.compare(a.UserInfo.FullName, b.UserInfo.FullName, isAsc);
                case 'role':
                    return this._filterPipe.compare(a.UserInfo.Rank, b.UserInfo.Rank, isAsc);
                case 'psid':
                    return this._filterPipe.compare(a.UserInfo.AcadisID, b.UserInfo.AcadisID, isAsc);
                case 'hours':
                    return this._filterPipe.compare(a.HoursCompleted, b.HoursCompleted, isAsc);
                case 'start':
                    return this._filterPipe.compare(a.StartDate, b.StartDate, isAsc);
                case 'end':
                    return this._filterPipe.compare(a.EndDate, b.EndDate, isAsc);
                default:
                    return 0;
            }
        });
    }

    /**
     * [setFilteredRecords] is triggered from entering/removing text from the roster's
     *  search input text field
     */
    public setFilteredRecords() {
        // toggle the searching bit to show some loading
        this.isSearching = true;

        // set the filtered data source
        this.courseRosterDataSource.data = this._filterPipe.transform(this.unfilteredFormattedClassRoster, { text: this.searchTextboxInputValue });

        // toggle the searching bit to hide loading
        this.isSearching = false;
    }

    /**
     * END MAT-TABLE SORTING/SEARCHING
     */

    /**
    * PRIVATE METHODS
    */

    /**
     * [_deleteCourseCredit] marks a [externalTrainingCredit] object's [IsDeleted] flag
     * and submits the update to the DB.
     */
    private _deleteCourseCredit(creditInfo: ExternalCreditInfo) {
        // set the record to deleted
        creditInfo.IsDeleted = true;

        // update the record
        this.externalTrainingService.updateExternalTrainingCredit(creditInfo).subscribe((data) => {
            // re-initialize the roster list
            this._getCourseRoster();
        });
    }

    /**
     * [_getCourseRoster] initializes the course roster list
     */
    private _getCourseRoster() {
        this.initialized = false;

        // gather the roster for the provided course
        var includeDeleted = false;
        this.externalTrainingService.getExternalTrainingCourseRoster(this.courseInfo.ExternalCreditCourseID, includeDeleted).subscribe(
            (roster) => {

                // define the roster list
                this.unfilteredFormattedClassRoster = roster as ExternalCreditInfo[];
                const data = this.unfilteredFormattedClassRoster.slice();

                this.courseRosterDataSource.data = data;

                // assign the paginator and sort components
                this.courseRosterDataSource.paginator = this.externalTrainingCoursesTablePaginator;
                this.courseRosterDataSource.sort = this.sort;

                this.initialized = true;
            },
            (error) => {
                console.error('externaltraining-error: ', error);
                this.initialized = true;
            }
        );
    }

    ngOnInit() {
        this._getCourseRoster();
    }
}