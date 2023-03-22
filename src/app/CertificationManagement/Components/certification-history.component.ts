import { Component, OnInit, Input, Injectable, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { CertificationTypeInfo, CertificationInfo } from '../Providers/certification-management.model';
import { CertificationManagementService } from '../Providers/certification-management.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { MatTableDataSource } from '@angular/material/table';
import { AlertController } from '@ionic/angular';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';

@Component({
    selector: 'certification-history',
    templateUrl: 'certification-history.component.html',
    styleUrls: [
        '../certification-management.page.scss'

    ]
})

export class CertificationHistory_Component implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        public certificationManagementService: CertificationManagementService,
        private _filterPipe: GenericFilterPipe,
        private _alertController: AlertController
    ) { }

    @Input() certificationID: number;
    public unfilteredFormattedCertifications: CertificationInfo[];

    public certificationHistoryDataSource = new MatTableDataSource<CertificationInfo>();
    public certificationHistory_matTable_displayedColumns: string[] = [
        'CompletionDate', 'ExpirationDate', 'Hours', 'View'
    ];

    public initialized: boolean = false;

    /**
    * [onViewCertificationBtnClick] handles the "View" button press.
    */
    public onViewCertificationBtnClick(certificationInfo: CertificationInfo) {
        this._viewCertificationFile(certificationInfo);
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

    private _getChildCertifications() {
        var includeDeleted = true;
        this.certificationManagementService.getCertificationsForParentCertificate(this.certificationID, includeDeleted).subscribe(
            (certifications) => {
                // iterate over the certification list to create some shorthand data
                // and assign it to the table datasource
                this.unfilteredFormattedCertifications = certifications as CertificationInfo[];
                this.unfilteredFormattedCertifications.forEach(certification => {
                    certification.IsExpired = new Date(certification.ExpirationDate) <= new Date();

                });

                const data = this.unfilteredFormattedCertifications.slice();

                this.certificationHistoryDataSource.data = data.sort((a, b) => {
                    const isAsc = true;
                    return this._filterPipe.compare(a.CompletionDate, b.CompletionDate, isAsc);
                });        

                this.initialized = true;
            },
            (error) => {
                console.error('certifications-error: ', error);
                this.initialized = true;
            }
        );
    }

    ngOnInit() {
        this.initialized = false;

        this._getChildCertifications();
    }
}