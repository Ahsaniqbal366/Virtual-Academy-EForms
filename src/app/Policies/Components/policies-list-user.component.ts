import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, AlertController, PopoverController } from '@ionic/angular';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/signin/providers/auth.service';
import { DNNEmbedService } from 'src/app/shared/DNN.Embed.Service';
import { PoliciesManagementService } from 'src/app/Policies/Providers/policies.service';
import { PoliciesUserInfo, PoliciesInfo, PoliciesServerInfo, MatTableDefinitionForExport } from 'src/app/Policies/Providers/policies.model';
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
import {
    NgxExtendedPdfViewerService,
  } from 'ngx-extended-pdf-viewer';

// define component
@Component({
    selector: 'policies-list-user-component',
    templateUrl: 'policies-list-user.component.html',
    styleUrls: ['../policies.page.scss'],
})

// create class for export
export class PoliciesListUser_Component implements OnInit, AfterViewInit {
    public policiesUserInfo: PoliciesUserInfo[];

    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public policiesManagementService: PoliciesManagementService,
        private _navController: NavController,
        private _route: ActivatedRoute,
        private _router: Router,
        private _addNewPolicyFactory: PolicyManagement_AddPolicyDialog_Factory,
        private _userAssesmentPolicyFactory: PolicyManagement_UserAssesmentDialog_Factory,
        private _alertController: AlertController,
        private _popoverController: PopoverController,
        private _auditLogDialogFactory: Policies_AuditLogDialog_Factory,
        private _loadingService: IonicLoadingService,
        private _filterPipe: GenericFilterPipe,
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

    public AgencyPolicies_matTable_displayedColumns: string[];
    public AgencyPolicies_matTable_displayedColumnDefinitionsForExport: MatTableDefinitionForExport[];

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

    public onExportClick(isPending: boolean): void {
        if(isPending == true){
            this._pdfExportService
            .exportMatTableToPDF(
                'Policies Export'
                , this.policies_matTable_displayedColumnDefinitionsForExport
                , this.policiesPendingDataSource
                );
        }
        else{
            this._pdfExportService
            .exportMatTableToPDF(
                'Policies Export'
                , this.AgencyPolicies_matTable_displayedColumnDefinitionsForExport
                , this.policiesDataSource
                );
        }
    }
    
    /**
     * [onshowPolicyToUserClick] opens the dialog to edit an existing policies
     */
    public showPolicyToUser(policiesInfo: PoliciesInfo) {
        this._userAssesmentPolicyFactory.openDialog(policiesInfo).afterClosed().subscribe(result => {
            if (result && result.confirmed) {
                this._buildPoliciesTable(true);
            }
        });
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
    }

    public setFilteredRecords(hasPendingUserAcknowledgement: boolean) {
        if(hasPendingUserAcknowledgement == true){
            this.isSearchingPending = true;

            this.policiesManagementService.getPoliciesForCurrentUser(hasPendingUserAcknowledgement, this.searchTextboxPendingInputValue).subscribe((policies) => {
                // format the data set
                this._formatAndCachePoliciesList(policies, hasPendingUserAcknowledgement);
            },
                (error) => {
                    console.error('policies-error: ', error);
            });
            this.policiesPendingDataSource.data = this.unfilteredFormattedPolicies;
            this.isSearchingPending = false;
        }
        else if(hasPendingUserAcknowledgement == false){
            this.isSearching = true;

            this.policiesManagementService.getPoliciesForCurrentUser(hasPendingUserAcknowledgement, this.searchTextboxInputValue).subscribe((policies) => {
                // format the data set
                this._formatAndCachePoliciesList(policies, hasPendingUserAcknowledgement);
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

    private _presentAuditLogDialog(policiesInfo: PoliciesInfo){
        this._auditLogDialogFactory.openDialog(policiesInfo).afterClosed().subscribe(result => {
            
        });
    }

    private async _gatherPolicies(isDeleted: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
                // gather policies for the currently logged in user
                this.policiesManagementService.getPoliciesForCurrentUser(true, this.searchTextboxInputValue).subscribe((policies) => {
                    this.unfilteredFormattedPolicies = policies as PoliciesInfo[];
                    this._formatAndCachePoliciesList(policies, true);
                    resolve();
                },
                    (error) => {
                        console.error('policies-error: ', error);
                        reject();
                    });
                
                    // gather pending policies for the currently logged in user
                this.policiesManagementService.getPoliciesForCurrentUser(false, this.searchTextboxInputValue).subscribe((policies) => {
                    this.unfilteredFormattedPolicies = policies as PoliciesInfo[];
                    this._formatAndCachePoliciesList(policies, false);
                    resolve();
                },
                    (error) => {
                        console.error('policies-error: ', error);
                        reject();
                    });
        });
    }
    

    private _defineMatTableColumns() {
            this.policies_matTable_displayedColumns = [
                'Policy Number', 'Title', 'EffectiveDate', 'ReviewDate', 'View'
            ];

            this.AgencyPolicies_matTable_displayedColumns = [
                'Policy Number', 'Title', 'EffectiveDate', 'ReviewDate','DateAcknowledged', 'View'
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
            }
        ];

        this.AgencyPolicies_matTable_displayedColumnDefinitionsForExport = [
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
                Width: 50
            },
            {
                FriendlyName: 'Review Date',
                TechnicalName: 'reviewDate',
                HideForPrint: false,
                Datatype: 'date-string',
                Width: 50
            },
            {
                FriendlyName: 'Acknowledged Date',
                TechnicalName: 'dateAcknowledged',
                HideForPrint: false,
                Datatype: 'date-string',
                Width: 50
            },
            {
                FriendlyName: 'View',
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
        this._gatherPolicies(false).then((resolution) => {
            if(isRefresh == false) {
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
        // this._gatherPoliciesUsers();
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
        
        if(isPending == false){
            this.policiesDataSource = new MatTableDataSource(this.unfilteredFormattedPolicies);
            this.policiesDataSource.paginator = this.policiesTablePaginator;
        }
        else if(isPending == true){
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
    private _setExpiryStatus(policies:PoliciesInfo){
        // gather the current date
        var currentDate =  moment();

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