import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, AlertController, PopoverController } from '@ionic/angular';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/signin/providers/auth.service';
import { DNNEmbedService } from 'src/app/shared/DNN.Embed.Service';
import { CertificationManagementService } from 'src/app/CertificationManagement/Providers/certification-management.service';
import { CertificationTypeInfo, CertificationInfo, CertificationServerInfo, MatTableDefinitionForExport } from 'src/app/CertificationManagement/Providers/certification-management.model';
import { CertificationManagement_AddCertificationDialog_Factory } from 'src/app/CertificationManagement/Components/Dialogs/add-new-certification.dialog'
import { CertificationManagementTablePopoverMenuComponent } from 'src/app/CertificationManagement/Components/Popovers/certification-management-table.popover-menu.component';
import { combineLatest } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';
import { MatPaginator } from '@angular/material/paginator';
import { CertificationPDFExportService } from 'src/app/CertificationManagement/Providers/certification-pdf-export.service';
import { ToastService } from 'src/app/shared/Toast.Service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { CertificationManagement_AuditLogDialog_Factory } from 'src/app/CertificationManagement/Components/AuditLog/Dialog/certification-audit-log.dialog';
import * as moment from 'moment';

// define component
@Component({
    selector: 'certification-list-component',
    templateUrl: 'certification-list.component.html',
    styleUrls: ['../../../certification-management.page.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})

// create class for export
export class CertificationList_Component implements OnInit, AfterViewInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public certificationManagementService: CertificationManagementService,
        private _navController: NavController,
        private _route: ActivatedRoute,
        private _router: Router,
        private _addNewCertificationFactory: CertificationManagement_AddCertificationDialog_Factory,
        private _alertController: AlertController,
        private _popoverController: PopoverController,
        private _auditLogDialogFactory: CertificationManagement_AuditLogDialog_Factory,
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
    public showRecentlyChanges: boolean = false;

    public unfilteredFormattedCertifications: CertificationInfo[];
    public unverifiedChangedExist: boolean = false;

    public certificationsDataSource = new MatTableDataSource<CertificationInfo>();
    public certifications_matTable_displayedColumns: string[];
    public certifications_matTable_displayedColumnDefinitionsForExport: MatTableDefinitionForExport[];

    // the currently selected [CertificationInfo] object to control row expansion
    public expandedElement: CertificationInfo | null;

    public isSearching: boolean = false;
    public isViewingArchives: boolean = false;
    public searchTextboxInputValue: string = '';

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) certificationsTablePaginator: MatPaginator;

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
        this._pdfExportService.exportMatTableToPDF('Certifications Export', this.certifications_matTable_displayedColumnDefinitionsForExport, this.certificationsDataSource);
    }

    public onReviewChangesBtnClick(): void {
        this.certificationManagementService.isReviewingCertificationChanges = !this.certificationManagementService.isReviewingCertificationChanges;

        this._buildCertificationTable();
    }

    

    /**
     * [onAddCertificationBtnClick] opens the dialog to add a new certification
     */
    public onAddCertificationBtnClick() {
        this._addNewCertificationFactory.openDialog(null, true).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                // re-initialize the certification list
                this._buildCertificationTable();
            }
        });
    }

    /**
     * [onEditCertificationBtnClick] opens the dialog to edit an existing certification
     */
    public onEditCertificationBtnClick(certificationInfo: CertificationInfo) {
        this._addNewCertificationFactory.openDialog(certificationInfo, false).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                certificationInfo = result.record;
            }
        });
    }

    /**
     * [onViewCertificationBtnClick] handles the "View" button press.
     */
    public onViewCertificationBtnClick(certificationInfo: CertificationInfo) {
        this._viewCertificationFile(certificationInfo);
    }

    /**
     * [onViewCertificationAuditLog] opens the dialog to view the certification's changelog
     */
    public onViewCertificationAuditLogBtnClick(certificationInfo: CertificationInfo) {
        this._presentAuditLogDialog(certificationInfo);
    }

    /**
     * [onRemoveCertificationBtnClick] handles the "Remove" button press.
     */
    public onRemoveCertificationBtnClick(certificationInfo: CertificationInfo) {
        this._alertController.create({
            header: 'Remove Certification',
            message: 'Are you sure you want to remove this certification?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this._deleteCertification(certificationInfo);
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
    public onRenewCertificationBtnClick(event: Event, certificationInfo: CertificationInfo) {
        event.stopPropagation();

        // initialize a new certification dialog to begin entering details for the renewal
        this._addNewCertificationFactory.openDialog(certificationInfo, false).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                this._buildCertificationTable();
            }
        });

    }

    /**
     * [onArchiveBtnClick] handles the event of the 'Archive' button being clicked in the edit view
     */
    public onUnarchiveCertificationBtnClick(event: Event, certificationInfo: CertificationInfo) {
        event.stopPropagation();
        // display a confirmation alert
        this._alertController.create({
            header: 'Unarchive Certification',
            message: 'Are you sure you want to unarchive this certification?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        // mark the certification as "Archived"
                        certificationInfo.IsDeleted = false;
                        // update the certification
                        this._updateCertificationInfo(certificationInfo);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    /**
     * [handleCertificationUpdate] handles the event emission of a certification being updated
     * in the 'See More' view.
     */
    public handleCertificationUpdate(certificationInfo: CertificationInfo) {
        // grab the list of certification data
        const data = this.certificationsDataSource.data.slice();

        // map the certification being updated to the unfiltered data list
        // to facilitate a smooth data update
        data.forEach(certification => {
            if (certification.CertificationID == certificationInfo.CertificationID) {
                // map the corresponding [CertificationTypeInfo] object to the updated certification
                certification.TypeInfo = this.certificationManagementService.certificationTypes.find(type => type.CertificationTypeID == certificationInfo.TypeID);
                certification = certificationInfo;
            }

            this._setExpiryStatus(certification);
        });

        // update the table's data source
        this.certificationsDataSource.data = data;
    }

    /**
     * [handleCertificationUpdate] handles the event emission of a certification being archived
     * in the 'See More' view.
     */
    public handleCertificationArchival() {
        // re-init the full table date to make sure that all archived certifications are removed
        this._buildCertificationTable();
    }

    /**
     * BEGIN MAT-TABLE SORTING/SEARCHING
     */
    public certificateSortChange(sort: Sort) {
        const data = this.certificationsDataSource.data.slice();

        if (!sort.active || sort.direction === '') {
            this.certificationsDataSource.data = data;
            return;
        }

        this.certificationsDataSource.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'user':
                    return this._filterPipe.compare(a.UserDisplayName, b.UserDisplayName, isAsc);
                case 'title':
                    return this._filterPipe.compare(a.Title, b.Title, isAsc);
                case 'type':
                    return this._filterPipe.compare(a.TypeInfo.Name, b.TypeInfo.Name, isAsc);
                case 'hours':
                    return this._filterPipe.compare(a.TrainingHours, b.TrainingHours, isAsc);
                case 'completion':
                    return this._filterPipe.compare(new Date(a.CompletionDate), new Date(b.CompletionDate), isAsc);
                case 'expiration':
                    return this._filterPipe.compare(new Date(a.ExpirationDate), new Date(b.ExpirationDate), isAsc);
                case 'alert':
                    return this._filterPipe.compare(new Date(a.AlertDate), new Date(b.AlertDate), isAsc);
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
        var preFilteredCertifications = this.unfilteredFormattedCertifications.filter((loopedCertification) => {
            return (loopedCertification.IsDeleted != this.showNonDeleted || loopedCertification.IsDeleted == this.showDeleted)
            && (this.certificationManagementService.isReviewingCertificationChanges ? loopedCertification.HasUnreviewedChanges : true)
        })

        this.certificationsDataSource.data = this._filterPipe.transform(preFilteredCertifications, { text: this.searchTextboxInputValue });

        this.isSearching = false;
    }
    /***
     * END MAT-TABLE SORTING/SEARCHING
     */

    /*******************************************
    * PRIVATE METHODS
    *******************************************/
    /**
     * [_updateCertificationInfo] issues the [updateCertification] API call then emits the
     * passed in event to the parent component
     */
    private _updateCertificationInfo(certificationInfo: CertificationInfo) {
        this._loadingService.presentLoading("Updating certification...");

        this.certificationManagementService.updateCertification(certificationInfo).subscribe((data: CertificationInfo) => {
            this._toastService.presentToast("Certification Updated");
            this._loadingService.dismissLoading();
        },
            (error: APIResponseError) => {
                console.log('certifications-error: ', error);
                this.initialized = true;
                this._loadingService.dismissLoading();
            }
        );
    }

    /**
     * [_deleteCertification] marks a [CertificationInfo] object's [IsDeleted] flag
     * and submits the update to the DB.
     */
    private _deleteCertification(certificationInfo: CertificationInfo) {
        certificationInfo.IsDeleted = true;

        this.certificationManagementService.updateCertification(certificationInfo).subscribe((data) => {
            // re-initialize the certification list
            this._buildCertificationTable();
        });
    }

    /**
     * [_viewCertificationFile] opens the given certification's cloudpath
     * if one exists
     */
    private _viewCertificationFile(certificationInfo: CertificationInfo) {
        // if there is a cloudpath, open a new tab for the link
        if (certificationInfo.Cloudpath) {
            window.open(certificationInfo.Cloudpath, '_blank');
        } else {
            this._alertController.create({
                message: "This certification does not have an uploaded file.",
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

    private _presentAuditLogDialog(certificationInfo: CertificationInfo){
        this._auditLogDialogFactory.openDialog(certificationInfo).afterClosed().subscribe(result => {
            
        });
    }

    /*******************************************
    * SELF INIT
    *******************************************/
    private _confirmUserPermissions() {
        if (this.certificationManagementService.isManagerView) {

            // check user access permissions to determine if they can access this view
            if (!this.certificationManagementService.serverInfo.permissions.isManager) {
                // if the user does not have access to the view, route them to the root certification management page
                // that allows them to view their own certifications only
                let baseUrl = this._router.url;
                baseUrl = this._router.url.split('/manager-view')[0];
                this._navController.navigateRoot(baseUrl);

            }
        }
    }

    private async _gatherCertifications(): Promise<void> {
        return new Promise((resolve, reject) => {
            // if manager view is being loaded
            if (this.certificationManagementService.isManagerView) {
                // check user access permissions to determine if they can access this view
                if (this.certificationManagementService.serverInfo.permissions.isManager) {
                    // gather all available certifications
                    this.certificationManagementService.getAllCertifications(this.includeDeletedInAPIGather).subscribe((certifications) => {
                        // format the data set
                        this._formatAndCacheCertificationsList(certifications);
                        resolve();
                    },
                        (error) => {
                            console.error('certifications-error: ', error);
                            reject();
                        });
                }
            } else {
                // gather certifications for the currently logged in user
                this.certificationManagementService.getCertificationsForCurrentUser(this.includeDeletedInAPIGather).subscribe((certifications) => {
                    this.unfilteredFormattedCertifications = certifications as CertificationInfo[];
                    this._formatAndCacheCertificationsList(certifications);
                    resolve();
                },
                    (error) => {
                        console.error('certifications-error: ', error);
                        reject();
                    });
            }
        });
    }

    private _defineMatTableColumns() {
        if (this.certificationManagementService.isManagerView) {
            this.certifications_matTable_displayedColumns = [
                'User', 'Title', 'Type', 'Hours', 'CompletionDate', 'ExpirationDate', 'AlertDate', 'View', 'Renew'
            ];
        } else {
            this.certifications_matTable_displayedColumns = [
                'Title', 'Type', 'Hours', 'CompletionDate', 'ExpirationDate', 'AlertDate', 'View', 'Renew'
            ];
        }

        // Defining the columns with some export related properties
        this.certifications_matTable_displayedColumnDefinitionsForExport = [
            {
                FriendlyName: 'User',
                TechnicalName: 'UserDisplayName',
                HideForPrint: this.certificationManagementService.isManagerView ? false : true,
                Datatype: 'string'
            },
            {
                FriendlyName: 'Title',
                TechnicalName: 'Title',
                HideForPrint: false,
                Datatype: 'string'
            },
            {
                FriendlyName: 'Type',
                TechnicalName: 'TypeInfo.Name',
                HideForPrint: false,
                Datatype: 'string'
            },
            {
                FriendlyName: 'Hours',
                TechnicalName: 'TrainingHours',
                HideForPrint: false,
                Datatype: 'number'
            },
            {
                FriendlyName: 'CompletionDate',
                TechnicalName: 'CompletionDate',
                HideForPrint: false,
                Datatype: 'date-string'
            },
            {
                FriendlyName: 'ExpirationDate',
                TechnicalName: 'ExpirationDate',
                HideForPrint: false,
                Datatype: 'date-string'
            },
            {
                FriendlyName: 'AlertDate',
                TechnicalName: 'AlertDate',
                HideForPrint: false,
                Datatype: 'date-string'
            },
            {
                FriendlyName: 'View',
                TechnicalName: '',
                HideForPrint: true,
                Datatype: ''
            },
            {
                FriendlyName: 'Renew',
                TechnicalName: '',
                HideForPrint: true,
                Datatype: ''
            }
        ];
    }

    private _buildCertificationTable() {
        // Any loaded subviews will clear the loading state.
        this.initialized = false;
        this._gatherCertifications().then((resolution) => {
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
        this.certificationManagementService.getServerInfo().subscribe(
            (serverInfo: any) => {
                this.certificationManagementService.serverInfo = new CertificationServerInfo(serverInfo);
                this.certificationManagementService.certificationTypes = serverInfo.certificationTypes as CertificationTypeInfo[];

                // determine if the view is 
                this.certificationManagementService.isManagerView = this._router.url.indexOf('/manager-view') !== -1;

                this._confirmUserPermissions();
                this._buildCertificationTable();

            },
            (error) => {
                console.error('certifications-error: ', error);
                this.initialized = true;
            }
        );

    }

    private _formatAndCacheCertificationsList(certifications: any) {
        this.unfilteredFormattedCertifications = certifications as CertificationInfo[];

        

        // iterate over the certification list to create some shorthand data
        // and assign it to the table datasource
        this.unfilteredFormattedCertifications.forEach(certification => {
            // format the mat-cell expiry style
            this._setExpiryStatus(certification);  
        });

        this.unverifiedChangedExist = this.unfilteredFormattedCertifications.some(c => c.HasUnreviewedChanges && !c.IsDeleted);

        this.certificationsDataSource = new MatTableDataSource(this.unfilteredFormattedCertifications);
        this.certificationsDataSource.paginator = this.certificationsTablePaginator;

        this.setFilteredRecords();

    }

    /**
     * [_setExpiryStatus] calculates and determines the severity of the
     * certification expiration based on predefined values. The values here
     * are used to designate the color class of the mat-cell containing the 
     * expiration date.
     */
    private _setExpiryStatus(certification:CertificationInfo){
        // gather the current date
        var currentDate =  moment();
        var expiryThresholds = this.certificationManagementService.serverInfo.ExpiryThresholds;

        // if today's date is past the current expiration date
        certification.IsExpired = currentDate.isAfter(moment(certification.ExpirationDate));

        // display the record as not nearing expiration
        certification.IsValid = !certification.IsExpired 
        && currentDate.isBefore(moment(certification.ExpirationDate).subtract(expiryThresholds.Nearing,'days'));

        // display the record as nearing the expiration
        certification.IsNearing = !certification.IsExpired 
        && currentDate.isAfter(moment(certification.ExpirationDate).subtract(expiryThresholds.Nearing,'days')) 
        && currentDate.isBefore(moment(certification.ExpirationDate).subtract(expiryThresholds.Moderate,'days'));

        // display the record as severely nearing the expiration
        certification.IsModerate = !certification.IsExpired 
        && currentDate.isAfter(moment(certification.ExpirationDate).subtract(expiryThresholds.Moderate,'days'));

    }

    ngOnInit() {
        this._init();
    }

    ngAfterViewInit() {
        this.certificationsDataSource.sort = this.sort;
        this.certificationsDataSource.paginator = this.certificationsTablePaginator;
    }
}