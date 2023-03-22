import { Component, OnInit, Input, Injectable, Inject, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { CertificationTypeInfo, CertificationInfo } from '../../Providers/certification-management.model';
import { CertificationManagementService } from '../../Providers/certification-management.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { AlertController } from '@ionic/angular';

@Component({
    selector: 'certification-audit-log',
    templateUrl: 'certification-audit-log.component.html',
    styleUrls: [
        '../../certification-management.page.scss'

    ]
})

export class CertificationAuditLog_Component implements OnInit {
    constructor(
        public certificationManagementService: CertificationManagementService,
        private _loadingService: IonicLoadingService) {
    }

    public initialized: boolean;

    @Input() certificationInfo: CertificationInfo;


   
    

    private _init() {
console.log(this.certificationManagementService.certificationTypes);
        
        this.initialized = false;
    }


    ngOnInit() {
        this._init();
    }
}