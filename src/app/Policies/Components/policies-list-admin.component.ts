import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, AlertController, PopoverController } from '@ionic/angular';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/signin/providers/auth.service';
import { DNNEmbedService } from 'src/app/shared/DNN.Embed.Service';
import { PoliciesManagementService } from 'src/app/Policies/Providers/policies.service';
import { PoliciesUserInfo, PoliciesInfo, PoliciesServerInfo, PoliciesDetailInfo, MatTableDefinitionForExport } from 'src/app/Policies/Providers/policies.model';
import { PolicyManagement_AddPolicyDialog_Factory } from 'src/app/Policies/Components/Dialogs/add-new-policy.dialog'
import { PolicyManagement_UserAssesmentDialog_Factory } from 'src/app/Policies/Components/Dialogs/user-assesment-policy.dialog'
import { PolicyManagement_AddPolicyAssesmentDialog_Factory } from 'src/app/Policies/Components/Dialogs/add-new-assesment.dialog'
import { PoliciesManagementTablePopoverMenuComponent } from 'src/app/Policies/Components/Popovers/policies-management-table.popover-menu.component';
import { combineLatest } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';
import { MatPaginator } from '@angular/material/paginator';
import { PoliciesPDFExportService } from 'src/app/Policies/Providers/policies-pdf-export.service';
import { ToastService } from 'src/app/shared/Toast.Service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { Policies_AuditLogDialog_Factory } from 'src/app/Policies/Components/AuditLog/Dialog/policies-audit-log.dialog';
import * as moment from 'moment';
import { ECrudActions, TPoliciesCB } from '../model/t-polices-actions';

// define component
@Component({
    selector: 'policies-list-admin-component',
    templateUrl: 'policies-list-admin.component.html',
    styleUrls: ['../policies.page.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})

// create class for export
export class PoliciesListAdmin_Component implements OnInit, AfterViewInit {
    public policiesUserInfo: PoliciesUserInfo[];

    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public policiesManagementService: PoliciesManagementService,
        private _addNewPolicyFactory: PolicyManagement_AddPolicyDialog_Factory,
        private _userAssesmentPolicyFactory: PolicyManagement_UserAssesmentDialog_Factory,
        private _alertController: AlertController,
        private _auditLogDialogFactory: Policies_AuditLogDialog_Factory,
        private _loadingService: IonicLoadingService,
        private _toastService: ToastService,
        private _pdfExportService: PoliciesPDFExportService) {
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

    public unfilteredFormattedPolicies: PoliciesInfo[];
    public unverifiedChangedExist: boolean = false;

    public policiesDataSource = new MatTableDataSource<PoliciesInfo>();
    public policiesPendingDataSource = new MatTableDataSource<PoliciesInfo>();
    public policies_matTable_displayedColumns: string[];
    public policies_matTable_displayedColumnDefinitionsForExport: MatTableDefinitionForExport[];

    // the currently selected [PoliciesInfo] object to control row expansion
    public expandedElement: PoliciesInfo | null;

    public isSearching: boolean = false;
    public isSearchingPending: boolean = false;
    public isViewingArchives: boolean = false;
    public searchTextboxInputValue: string = '';
    public searchTextboxPendingInputValue: string = '';

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('pendingPoliciesTablePaginator') pendingPoliciesTablePaginator: MatPaginator;
    @ViewChild('policiesTablePaginator') policiesTablePaginator: MatPaginator;

    /*******************************************
    * PUBLIC METHODS
    *******************************************/

    public onArchivesClick(any) {
        this.isViewingArchives = !this.isViewingArchives;
        this.showDeleted = this.isViewingArchives;
        this.showNonDeleted = !this.isViewingArchives;
        this._gatherPolicies(this.showDeleted, false);
    }

    public onExportClick(isPending: boolean): void {
        if (isPending == true) {
            this._pdfExportService.exportMatTableToPDF('Policies Export', this.policies_matTable_displayedColumnDefinitionsForExport, this.policiesPendingDataSource);
        }
        else {
            this._pdfExportService.exportMatTableToPDF('Policies Export', this.policies_matTable_displayedColumnDefinitionsForExport, this.policiesDataSource);
        }
    }

    public onReviewChangesBtnClick(): void {
        this.policiesManagementService.isReviewingPoliciesChanges = !this.policiesManagementService.isReviewingPoliciesChanges;

        this._buildPoliciesTable();
    }

    private async _gatherPoliciesUsers(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.policiesManagementService.getPoliciesUserInfo().subscribe((policies) => {
                this.policiesUserInfo = policies as PoliciesUserInfo[];
                resolve();
            },
                (error) => {
                    console.error('policies-error: ', error);
                    reject();
                });
        });
    }

    /**
     * [onAddPoliciesBtnClick] opens the dialog to add a new Policy
     */
    public onAddPoliciesBtnClick() {
        this._addNewPolicyFactory.openDialog(null, true).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                // re-initialize the policies list
                this._buildPoliciesTable(true);
            }
        });
    }

    /**
     * [onEditPoliciesBtnClick] opens the dialog to edit an existing policies
     */
    public onEditPoliciesBtnClick(policiesInfo: PoliciesInfo) {
        this._addNewPolicyFactory.openDialog(policiesInfo, false).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                policiesInfo = result.record;
            }
        });
    }

    /**
     * [onEditPoliciesBtnClick] opens the dialog to edit an existing policies
     */
    public showPendingPolicyDetails(policiesInfo: PoliciesInfo) {
        this._userAssesmentPolicyFactory.openDialog(policiesInfo).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                policiesInfo = result.record;
            }
        });
    }

    /**
     * [onViewPoliciesBtnClick] handles the "View" button press.
     */
    public onViewPoliciesBtnClick(policiesInfo: PoliciesInfo) {
        this._viewPoliciesFile(policiesInfo);
    }

    /**
     * [onViewPoliciesAuditLog] opens the dialog to view the Policies's changelog
     */
    public onViewPoliciesAuditLogBtnClick(policiesInfo: PoliciesInfo) {
        this._presentAuditLogDialog(policiesInfo);
    }

    /**
     * [onRemovePoliciesBtnClick] handles the "Remove" button press.
     */
    public onRemovePoliciesBtnClick(policiesInfo: PoliciesInfo) {
        this._alertController.create({
            header: 'Remove Policy',
            message: 'Are you sure you want to remove this policy?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this._deletePolicies(policiesInfo);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });

    }

    /**
     * [onRenewPoliciesBtnClick] handles the "Renew" button press
     */
    public onRenewPoliciesBtnClick(event: Event, policiesInfo: PoliciesInfo) {
        event.stopPropagation();

        // initialize a new Policy dialog to begin entering details for the renewal
        this._addNewPolicyFactory.openDialog(policiesInfo, false).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                this._buildPoliciesTable();
            }
        });

    }

    /**
     * [onArchiveBtnClick] handles the event of the 'Archive' button being clicked in the edit view
     */
    public onUnarchivePoliciesBtnClick(event: Event, policiesInfo: PoliciesInfo) {
        event.stopPropagation();
        // display a confirmation alert
        this._alertController.create({
            header: 'Unarchive Policy',
            message: 'Are you sure you want to unarchive this policy?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        // mark the Policy as "Archived"
                        // policiesInfo.isDeleted = false;
                        // update the Policy
                        this._updatePoliciesInfoUnArchive(policiesInfo);
                    }
                }
            ]
        }).then(alertEl => {
            alertEl.present();
        });
    }

    /**
     * [handlePoliciesUpdate] handles the event emission of a policies being updated
     * in the 'See More' view.
     */
    public handlePoliciesUpdate(payload: TPoliciesCB<PoliciesDetailInfo>): void {
        this.expandedElement = null;
        if (payload.action) {
            if (payload.action == ECrudActions.update || payload.action == ECrudActions.reIssue) {
                this._gatherPolicies(false, true);
            }
        }
    }

    /**
     * [handlePoliciesUpdate] handles the event emission of a policies being archived
     * in the 'See More' view.
     */
    public handlePoliciesArchival() {
        // re-init the full table date to make sure that all archived policiess are removed
        this._buildPoliciesTable();
    }

    /**
     * BEGIN MAT-TABLE SORTING/SEARCHING
     */
    public policiesSortChange(sort: Sort) {
        const data = this.policiesDataSource.data.slice();

        if (!sort.active || sort.direction === '') {
            this.policiesDataSource.data = data;
            return;
        }

        // this.policiesDataSource.data = data.sort((a, b) => {
        //     const isAsc = sort.direction === 'asc';
        //     switch (sort.active) {
        //         case 'user':
        //             return this._filterPipe.compare(a.UserDisplayName, b.UserDisplayName, isAsc);
        //         case 'title':
        //             return this._filterPipe.compare(a.Title, b.Title, isAsc);
        //         case 'type':
        //             return this._filterPipe.compare(a.TypeInfo.Name, b.TypeInfo.Name, isAsc);
        //         case 'completion':
        //             return this._filterPipe.compare(new Date(a.CompletionDate), new Date(b.CompletionDate), isAsc);
        //         case 'expiration':
        //             return this._filterPipe.compare(new Date(a.ExpirationDate), new Date(b.ExpirationDate), isAsc);
        //         case 'alert':
        //             return this._filterPipe.compare(new Date(a.AlertDate), new Date(b.AlertDate), isAsc);
        //         default:
        //             return 0;
        //     }
        // });
    }

    public setFilteredRecords(hasPendingUserAcknowledgement: boolean) {
        
        if (hasPendingUserAcknowledgement == true) {
            this.isSearchingPending = true;
            this.policiesManagementService
            .getAllPolicies(
                false
                , this.searchTextboxPendingInputValue
                , hasPendingUserAcknowledgement)
                .subscribe((policies) => {
                // format the data set
                this._formatAndCachePoliciesList(policies, true);
            },
                (error) => {
                    console.error('policies-error: ', error);
                });

            this.policiesPendingDataSource.data = this.unfilteredFormattedPolicies;
            this.isSearchingPending = false;
        }
        else {
            this.isSearching = true;
            this.policiesManagementService
            .getAllPolicies(
                this.isViewingArchives
                , this.searchTextboxInputValue
                , hasPendingUserAcknowledgement)
                .subscribe((policies) => {
                // format the data set
                this._formatAndCachePoliciesList(policies, false);
            },
                (error) => {
                    console.error('policies-error: ', error);
                });

            this.policiesDataSource.data = this.unfilteredFormattedPolicies;
            this.isSearching = false;
        }
    }
    /***
     * END MAT-TABLE SORTING/SEARCHING
     */

    /*******************************************
    * PRIVATE METHODS
    *******************************************/
    /**
     * [_updatePoliciesInfoUnArchive] issues the [updatePolicies] API call then emits the
     * passed in event to the parent component
     */
    private _updatePoliciesInfoUnArchive(policiesInfo: PoliciesInfo) {
        this._loadingService.presentLoading("Updating policies...");

        this.policiesManagementService.unarchivePolicy(policiesInfo.policyId).subscribe((data: PoliciesInfo) => {
            this._toastService.presentToast("Policy Restored");
            location.reload();
            this._loadingService.dismissLoading();
        },
            (error: APIResponseError) => {
                console.log('policies-error: ', error);
                this.initialized = true;
                this._loadingService.dismissLoading();
            }
        );
    }

    /**
     * [_deletePolicies] marks a [PoliciesInfo] object's [IsDeleted] flag
     * and submits the update to the DB.
     */
    private _deletePolicies(policiesInfo: PoliciesInfo) {
        // policiesInfo.policyAssessments.isDeleted = true;

        this.policiesManagementService.addPolicy(policiesInfo).subscribe((data) => {
            // re-initialize the policies list
            this._buildPoliciesTable();
        });
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

    private _presentAuditLogDialog(policiesInfo: PoliciesInfo) {
        this._auditLogDialogFactory.openDialog(policiesInfo).afterClosed().subscribe(result => {

        });
    }

    private async _gatherPolicies(isDeleted: boolean, isPending: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            // if manager view is being loaded
            // check user access permissions to determine if they can access this view
            //     // gather all available policies
            if (isPending == false) {
                this.policiesManagementService.getAllPolicies(isDeleted, this.searchTextboxInputValue, false).subscribe((policies) => {
                    // format the data set
                    this._formatAndCachePoliciesList(policies, false);
                    resolve();
                },
                    (error) => {
                        console.error('policies-error: ', error);
                        reject();
                    });

                this._gatherPoliciesUsers();
            }
            else {
                this.policiesManagementService.getAllPolicies(isDeleted, this.searchTextboxInputValue, true).subscribe((policies) => {
                    // format the data set
                    this._formatAndCachePoliciesList(policies, true);
                    resolve();
                },
                    (error) => {
                        console.error('policies-error: ', error);
                        reject();
                    });

                this.policiesManagementService.getAllPolicies(isDeleted, this.searchTextboxInputValue, false).subscribe((policies) => {
                    // format the data set
                    this._formatAndCachePoliciesList(policies, false);
                    resolve();
                },
                    (error) => {
                        console.error('policies-error: ', error);
                        reject();
                    });
                this._gatherPoliciesUsers();
            }

        });
    }

    private _defineMatTableColumns() {
        this.policies_matTable_displayedColumns = [
            'Policy Number', 'Title', 'EffectiveDate', 'ReviewDate', 'Acknowledged/Assigned', 'View', 'Renew'
        ];

        // Defining the columns with some export related properties
        this.policies_matTable_displayedColumnDefinitionsForExport = [
            {
                FriendlyName: 'Policy Number',
                TechnicalName: 'policyNumber',
                HideForPrint: false,
                Datatype: 'number',
                Width: 100
            },
            {
                FriendlyName: 'Policy Title',
                TechnicalName: 'friendlyName',
                HideForPrint: false,
                Datatype: 'string',
                Width: 200
            },
            {
                FriendlyName: 'Effective Date',
                TechnicalName: 'effectiveDate',
                HideForPrint: false,
                Datatype: 'date-string',
                Width: 100
            },
            {
                FriendlyName: 'Review Date',
                TechnicalName: 'reviewDate',
                HideForPrint: false,
                Datatype: 'date-string',
                Width: 100
            },
            {
                FriendlyName: 'View',
                TechnicalName: '',
                HideForPrint: true,
                Datatype: '',
                Width: 100
            },
            {
                FriendlyName: 'Renew',
                TechnicalName: '',
                HideForPrint: true,
                Datatype: '',
                Width: 100
            }
        ];
    }

    private _buildPoliciesTable(isRefresh: boolean = false) {
        // Any loaded subviews will clear the loading state.
        this.initialized = false;
        this._gatherPolicies(false, true).then((resolution) => {
            if (isRefresh == false) {
                this._defineMatTableColumns();
            }
            this.initialized = true;
        }, (rejection) => {
            // TODO: add error case here
            this.initialized = true;
        });
    }

    public refreshGrid() {
        this.searchTextboxPendingInputValue='';
        this._buildPoliciesTable(true);
    }

    private _init() {
        // Any loaded subviews will clear the loading state.
        this.initialized = false;
        this.policiesManagementService.getTokenInfo().subscribe((tokenInfo) => {
            this.policiesManagementService.serverInfo = new PoliciesServerInfo(tokenInfo);
            this.policiesManagementService.isAdmin = this.policiesManagementService.serverInfo.isAdmin;
            this._buildPoliciesTable();
        },
            (error) => {
                console.error('policies-error: ', error);
                this.initialized = true;
            }
        );
    }

    private _formatAndCachePoliciesList(policies: any, isPending: boolean) {
        this.unfilteredFormattedPolicies = policies as PoliciesInfo[];

        // iterate over the policies list to create some shorthand data
        // and assign it to the table datasource
        this.unfilteredFormattedPolicies.forEach(policies => {
            // format the mat-cell expiry style
            this._setExpiryStatus(policies);
        });

        if (isPending == false) {
            this.policiesDataSource = new MatTableDataSource(this.unfilteredFormattedPolicies);
            this.policiesDataSource.paginator = this.policiesTablePaginator;
        }
        else if (isPending == true) {

            this.policiesPendingDataSource = new MatTableDataSource(this.unfilteredFormattedPolicies);
            this.policiesPendingDataSource.paginator = this.pendingPoliciesTablePaginator;
        }
        // isPending ?  this.policiesDataSource = new MatTableDataSource(this.unfilteredFormattedPolicies) : this.policiesPendingDataSource = new MatTableDataSource(this.unfilteredFormattedPolicies);
        //    console.log("check another penfing", this.unfilteredFormattedPolicies);



        // this.setFilteredRecords();

    }

    /**
     * [_setExpiryStatus] calculates and determines the severity of the
     * policies expiration based on predefined values. The values here
     * are used to designate the color class of the mat-cell containing the 
     * expiration date.
     */
    private _setExpiryStatus(policies: PoliciesInfo) {
        // gather the current date
        var currentDate = moment();

    }


    ngOnInit() {
        this._init();
    }

    ngAfterViewInit() {
        this.policiesDataSource.sort = this.sort;
        this.policiesPendingDataSource.sort = this.sort;
        this.policiesDataSource.paginator = this.policiesTablePaginator;
        this.policiesPendingDataSource.paginator = this.pendingPoliciesTablePaginator;
    }
}