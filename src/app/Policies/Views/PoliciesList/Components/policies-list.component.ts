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
    selector: 'policies-list-component',
    templateUrl: 'policies-list.component.html',
    styleUrls: ['../../../policies.page.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})

// create class for export
export class PoliciesList_Component implements OnInit {
    public policiesUserInfo: PoliciesUserInfo[];

    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public policiesManagementService: PoliciesManagementService,) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;

    private _init() {
        // Any loaded subviews will clear the loading state.
        this.initialized = false;
        // this._gatherPoliciesUsers();
        this.policiesManagementService.getTokenInfo().subscribe((tokenInfo) => {
            this.policiesManagementService.serverInfo = new PoliciesServerInfo(tokenInfo);
            this.policiesManagementService.isAdmin = this.policiesManagementService.serverInfo.isAdmin;
          },
          (error) => {
            console.error('policies-error: ', error);
            this.initialized = true;
        }
    );
    }



    ngOnInit() {
        this._init();
    }
}