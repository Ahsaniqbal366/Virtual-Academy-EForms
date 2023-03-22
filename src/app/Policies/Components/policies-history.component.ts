import { Component, OnInit, Input, Injectable, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { PoliciesInfo } from '../Providers/policies.model';
import { PoliciesManagementService } from '../Providers/policies.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { MatTableDataSource } from '@angular/material/table';
import { AlertController } from '@ionic/angular';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';

@Component({
    selector: 'policies-history',
    templateUrl: 'policies-history.component.html',
    styleUrls: [
        '../policies.page.scss'

    ],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})

export class PoliciesHistory_Component implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public policiesManagementService: PoliciesManagementService,
        private _filterPipe: GenericFilterPipe,
        private _alertController: AlertController
    ) { }

    @Input() policiesID: number;
    public unfilteredFormattedPolicies: PoliciesInfo[];
    public unfilteredFormattedPoliciesStatus: PoliciesInfo[];
    public expandedElement: PoliciesInfo | null;
    public policiesHistoryDataSource = new MatTableDataSource<PoliciesInfo>();
    public policiesHistory_matTable_displayedColumns: string[] = [
        'Policy Number', 'Title', 'EffectiveDate', 'ReviewDate', 'View'
    ];

    public initialized: boolean = false;
    public noreview: boolean = false;

    /**
    * [onViewPoliciesBtnClick] handles the "View" button press.
    */
    public onViewPoliciesBtnClick(policiesInfo: PoliciesInfo) {
        this._viewPoliciesFile(policiesInfo);
    }


    /**
    * [_viewPoliciesFile] opens the given policy's cloudpath
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

    private _getChildPolicies() {
        var includeDeleted = true;
        this.policiesManagementService.getPolicyDetails(this.policiesID, 2).subscribe(
            (policies) => {
                // iterate over the policy list to create some shorthand data
                // and assign it to the table datasource
                if(policies == undefined){
                    this.noreview= true;
                }
                else{
                    this.unfilteredFormattedPolicies = policies as PoliciesInfo[];
                    this.unfilteredFormattedPolicies.forEach(policy => {
                        policy.isExpired = new Date(policy.expireDate) <= new Date();
                    });
                    const data = this.unfilteredFormattedPolicies.slice();
                    this.policiesHistoryDataSource.data = data.sort((a, b) => {
                        const isAsc = true;
                        return this._filterPipe.compare(a.effectiveDate, b.effectiveDate, isAsc);
                    });  
                    this.initialized = true;
                }
                

                      
            },
            (error: APIResponseError) => {
                console.error('policies-error: ', error);
                this.initialized = true;
             }
        );
    }

    ngOnInit() {
        this.initialized = false;

        this._getChildPolicies();
    }
}