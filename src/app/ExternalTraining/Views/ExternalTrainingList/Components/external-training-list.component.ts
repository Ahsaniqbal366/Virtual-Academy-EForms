import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, AlertController, PopoverController } from '@ionic/angular';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/signin/providers/auth.service';
import { DNNEmbedService } from 'src/app/shared/DNN.Embed.Service';
import { ExternalTrainingService } from 'src/app/ExternalTraining/Providers/external-training.service';
import { CreditTypeInfo, ExternalCreditCourseInfo, ExternalTrainingServerInfo, MatTableDefinitionForExport } from 'src/app/ExternalTraining/Providers/external-training.model';
import { ExternalTraining_AddExternalTrainingDialog_Factory } from 'src/app/ExternalTraining/Components/Dialogs/add-new-external-training.dialog'
import { ExternalTrainingTablePopoverMenuComponent } from 'src/app/ExternalTraining/Components/Popovers/external-training-table.popover-menu.component';
import { combineLatest } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';
import { MatPaginator } from '@angular/material/paginator';
import { CertificationPDFExportService } from 'src/app/ExternalTraining/Providers/external-training-pdf-export.service';
import { ToastService } from 'src/app/shared/Toast.Service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';

// define component
@Component({
    selector: 'external-training-list-component',
    templateUrl: 'external-training-list.component.html',
    styleUrls: ['../../../external-training.page.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})

// create class for export
export class ExternalTrainingList_Component implements OnInit, AfterViewInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public externalTrainingService: ExternalTrainingService,
        private _navController: NavController,
        private _route: ActivatedRoute,
        private _router: Router,
        private _addNewCertificationFactory: ExternalTraining_AddExternalTrainingDialog_Factory,
        private _alertController: AlertController,
        private _popoverController: PopoverController,
        private _loadingService: IonicLoadingService,
        private _filterPipe: GenericFilterPipe,
        private _toastService: ToastService,
        private _pdfExportService: CertificationPDFExportService) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;
    // ACJ 12/06/21 Always gathering deleted records from the API and simply hidden from view
    public includeDeletedInAPIGather: boolean = true;
    public showDeleted: boolean = false;
    public showNonDeleted: boolean = true;

    public unfilteredFormattedCourses: ExternalCreditCourseInfo[];

    public externalTrainingCoursesDataSource = new MatTableDataSource<ExternalCreditCourseInfo>();
    public externalTrainingCourses_matTable_displayedColumns: string[];
    public externalTrainingCourses_matTable_displayedColumnDefinitionsForExport: MatTableDefinitionForExport[];

    // the currently selected [externalTrainingInfo] object to control row expansion
    public expandedElement: ExternalCreditCourseInfo | null;

    public isSearching: boolean = false;
    public isViewingArchives: boolean = false;
    public searchTextboxInputValue: string = '';

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) externalTrainingCoursesTablePaginator: MatPaginator;

    /*******************************************
    * PUBLIC METHODS
    *******************************************/

    public onArchivesClick() {
        this.isViewingArchives = !this.isViewingArchives;
        this.showDeleted = this.isViewingArchives;
        this.showNonDeleted = !this.isViewingArchives;
        this.setFilteredRecords();
    }

    public onExportClick(): void {
        this._pdfExportService.exportMatTableToPDF('External Training Export', this.externalTrainingCourses_matTable_displayedColumnDefinitionsForExport, this.externalTrainingCoursesDataSource);
    }

    /**
     * [onAddExternalTrainingBtnClick] navigates to the add-new-course view
     */
    public onAddExternalTrainingBtnClick() {
        let baseUrl = this._router.url;
        this._router.navigate([baseUrl + '/add-new-course']);
    }

    /**
     * [onEditCertificationBtnClick] opens the dialog to edit an existing externalTraining
     */
    public onEditCertificationBtnClick(externalTrainingInfo: ExternalCreditCourseInfo) {
        this._addNewCertificationFactory.openDialog(externalTrainingInfo, false).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                externalTrainingInfo = result.record;


            }
        });
    }

    /**
     * [onViewCertificationBtnClick] handles the "View" button press.
     */
    public onViewCertificationBtnClick(externalTrainingInfo: ExternalCreditCourseInfo) {
        this._viewCertificationFile(externalTrainingInfo);
    }

    /**
     * [onRemoveCertificationBtnClick] handles the "Remove" button press.
     */
    public onRemoveCertificationBtnClick(externalTrainingInfo: ExternalCreditCourseInfo) {
        this._alertController.create({
            header: 'Remove ExternalTraining',
            message: 'Are you sure you want to remove this training?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this._deleteCertification(externalTrainingInfo);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });

    }

    /**
     * [onRenewCertificationBtnClick] handles the "Renew" button press
     */
    public onRenewCertificationBtnClick(event: Event, externalTrainingInfo: ExternalCreditCourseInfo) {
        event.stopPropagation();

        // initialize a new externalTraining dialog to begin entering details for the renewal
        this._addNewCertificationFactory.openDialog(externalTrainingInfo, false).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                this._buildCertificationTable();
            }
        });

    }

    /**
     * [onArchiveBtnClick] handles the event of the 'Archive' button being clicked in the edit view
     */
    public onUnarchiveCertificationBtnClick(event: Event, externalTrainingInfo: ExternalCreditCourseInfo) {
        event.stopPropagation();
        // display a confirmation alert
        this._alertController.create({
            header: 'Unarchive ExternalTraining',
            message: 'Are you sure you want to unarchive this externalTraining?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        // mark the externalTraining as "Archived"
                        externalTrainingInfo.IsDeleted = false;
                        // update the externalTraining
                        this._updateExternalTrainingInfo(externalTrainingInfo);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    /**
     * [handleCertificationUpdate] handles the event emission of a externalTraining being updated
     * in the 'See More' view.
     */
    public handleExternalTrainingCourseUpdate(externalTrainingInfo: ExternalCreditCourseInfo) {
        // grab the list of externalTraining data
        const data = this.externalTrainingCoursesDataSource.data.slice();

        // map the externalTraining being updated to the unfiltered data list
        // to facilitate a smooth data update
        data.forEach(externalTraining => {
            if (externalTraining.ExternalCreditCourseID == externalTrainingInfo.ExternalCreditCourseID) {
                // map the corresponding [CertificationTypeInfo] object to the updated externalTraining
                externalTraining.CourseTypeInfo = this.externalTrainingService.externalTrainingTypes.find(type => type.ExternalCreditTypeID == externalTrainingInfo.CourseTypeInfo);
                externalTraining = externalTrainingInfo;
            }
        });

        // update the table's data source
        this.externalTrainingCoursesDataSource.data = data;
    }

    /**
     * [handleCertificationUpdate] handles the event emission of a externalTraining being archived
     * in the 'See More' view.
     */
    public handleCertificationArchival() {
        // re-init the full table date to make sure that all archived certifications are removed
        this._buildCertificationTable();
    }

    /**
     * BEGIN MAT-TABLE SORTING/SEARCHING
     */
    public courseSortChange(sort: Sort) {
        const data = this.externalTrainingCoursesDataSource.data.slice();

        if (!sort.active || sort.direction === '') {
            this.externalTrainingCoursesDataSource.data = data;
            return;
        }

        this.externalTrainingCoursesDataSource.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'course':
                    return this._filterPipe.compare(a.Name, b.Name, isAsc);
                case 'type':
                    return this._filterPipe.compare(a.CreditTypeInfo.Name, b.CreditTypeInfo.Name, isAsc);
                case 'createdondate':
                    return this._filterPipe.compare(a.CreatedOnDate, b.CreatedOnDate, isAsc);
                case 'startdate':
                    return this._filterPipe.compare(a.StartDate, b.StartDate, isAsc);
                case 'enddate':
                    return this._filterPipe.compare(a.EndDate, b.EndDate, isAsc);
                case 'stateapproved':
                    return this._filterPipe.compare(a.IsStateApproved.toString(), b.IsStateApproved.toString(), isAsc);
                default:
                    return 0;
            }
        });
    }

    public setFilteredRecords() {
        this.isSearching = true;

        var hasSearchtext = this.searchTextboxInputValue != '';
        this.showDeleted = this.isViewingArchives ? true : hasSearchtext;
        this.showNonDeleted = this.isViewingArchives ? hasSearchtext : true;

        // Filter out Non-deleted records first, if needed
        var preFilteredCertifications = this.unfilteredFormattedCourses.filter((loopedCertification) => {
            return (loopedCertification.IsDeleted != this.showNonDeleted || loopedCertification.IsDeleted == this.showDeleted)
        })

        this.externalTrainingCoursesDataSource.data = this._filterPipe.transform(preFilteredCertifications, { text: this.searchTextboxInputValue });

        this.isSearching = false;
    }
    /***
     * END MAT-TABLE SORTING/SEARCHING
     */

    /*******************************************
    * PRIVATE METHODS
    *******************************************/
    /**
     * [_updateExternalTrainingInfo] issues the [updateCertification] API call then emits the
     * passed in event to the parent component
     */
    private _updateExternalTrainingInfo(externalTrainingInfo: ExternalCreditCourseInfo) {
        this._loadingService.presentLoading("Updating externalTraining...");

        this.externalTrainingService.updateExternalTrainingCourse(externalTrainingInfo).subscribe((data: ExternalCreditCourseInfo) => {
            this._toastService.presentToast("ExternalTraining Updated");
            this._loadingService.dismissLoading();
        },
            (error: APIResponseError) => {
                console.log('externaltraining-error: ', error);
                this.initialized = true;
                this._loadingService.dismissLoading();
            }
        );
    }

    /**
     * [_deleteCertification] marks a [externalTrainingInfo] object's [IsDeleted] flag
     * and submits the update to the DB.
     */
    private _deleteCertification(externalTrainingInfo: ExternalCreditCourseInfo) {
        externalTrainingInfo.IsDeleted = true;

        this.externalTrainingService.updateExternalTrainingCourse(externalTrainingInfo).subscribe((data) => {
            // re-initialize the externalTraining list
            this._buildCertificationTable();
        });
    }

    /**
     * [_viewCertificationFile] opens the given externalTraining's cloudpath
     * if one exists
     */
    private _viewCertificationFile(externalTrainingInfo: ExternalCreditCourseInfo) {
        // if there is a cloudpath, open a new tab for the link
        if (externalTrainingInfo.AdditionalDetailsUploadPath) {
            window.open(externalTrainingInfo.AdditionalDetailsUploadPath, '_blank');
        } else {
            this._alertController.create({
                message: "This externalTraining does not have an uploaded file.",
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

    /*******************************************
    * SELF INIT
    *******************************************/
    private _confirmUserPermissions() {
        if (this.externalTrainingService.isManagerView) {

            // check user access permissions to determine if they can access this view
            if (!this.externalTrainingService.serverInfo.permissions.isManager) {
                // if the user does not have access to the view, route them to the root externalTraining management page
                // that allows them to view their own certifications only
                let baseUrl = this._router.url;
                baseUrl = this._router.url.split('/manager-view')[0];
                this._navController.navigateRoot(baseUrl);

            }
        }
    }

    private async _gatherExternalTrainingCourses(): Promise<void> {
        return new Promise((resolve, reject) => {

            // gather all available certifications
            this.externalTrainingService.getExternalTrainingCourses(this.includeDeletedInAPIGather).subscribe((certifications) => {
                // format the data set
                this._formatAndCacheExternalTrainingCoursesList(certifications);
                resolve();
            },
                (error) => {
                    console.error('externaltraining-error: ', error);
                    reject();
                });


        });
    }

    private _defineMatTableColumns() {
        this.externalTrainingCourses_matTable_displayedColumns = [
            'Course', 'Category', 'CreatedOnDate', 'StartDate', 'EndDate', 'StateApproved', 'View'
        ];


        // Defining the columns with some export related properties
        this.externalTrainingCourses_matTable_displayedColumnDefinitionsForExport = [
            {
                FriendlyName: 'Course',
                TechnicalName: 'Name',
                HideForPrint: false,
                Datatype: 'string'
            },
            {
                FriendlyName: 'Category',
                TechnicalName: 'CreditTypeInfo.Name',
                HideForPrint: false,
                Datatype: 'string'
            },
            {
                FriendlyName: 'Created On Date',
                TechnicalName: 'CreatedOnDate',
                HideForPrint: false,
                Datatype: 'date-string'
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
                FriendlyName: 'State Approved',
                TechnicalName: 'IsStateApproved',
                HideForPrint: false,
                Datatype: 'boolean'
            },
            {
                FriendlyName: 'View',
                TechnicalName: '',
                HideForPrint: true,
                Datatype: ''
            }
        ];
    }

    private _buildCertificationTable() {
        // Any loaded subviews will clear the loading state.
        this.initialized = false;
        this._gatherExternalTrainingCourses().then((resolution) => {
            this._defineMatTableColumns();
            this.initialized = true;
        }, (rejection) => {
            // TODO: add error case here
            this.initialized = true;
        });
    }


    private _init() {
        // Any loaded subviews will clear the loading state.
        this.initialized = false;

        // initialize component data
        this.externalTrainingService.getServerInfo().subscribe(
            (serverInfo: any) => {
                this.externalTrainingService.serverInfo = new ExternalTrainingServerInfo(serverInfo);
                this.externalTrainingService.externalTrainingTypes = serverInfo.ExternalTrainingTypes as CreditTypeInfo[];

                // determine if the view is 
                this.externalTrainingService.isManagerView = this._router.url.indexOf('/manager-view') !== -1;

                this._confirmUserPermissions();
                this._buildCertificationTable();

            },
            (error) => {
                console.error('externaltraining-error: ', error);
                this.initialized = true;
            }
        );

    }

    private _formatAndCacheExternalTrainingCoursesList(courses: any) {
        this.unfilteredFormattedCourses = courses as ExternalCreditCourseInfo[];

        // iterate over the externalTraining list to create some shorthand data
        // and assign it to the table datasource
        this.unfilteredFormattedCourses.forEach(externalTraining => {

        });


        this.externalTrainingCoursesDataSource = new MatTableDataSource(this.unfilteredFormattedCourses);
        this.externalTrainingCoursesDataSource.paginator = this.externalTrainingCoursesTablePaginator;

        this.setFilteredRecords();

    }

    ngOnInit() {
        this._init();
    }

    ngAfterViewInit() {
        this.externalTrainingCoursesDataSource.sort = this.sort;
        this.externalTrainingCoursesDataSource.paginator = this.externalTrainingCoursesTablePaginator;
    }
}