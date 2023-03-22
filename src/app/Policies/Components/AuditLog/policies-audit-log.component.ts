import { Component, OnInit, Input, Injectable, Inject, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isNullOrUndefined } from 'is-what';
import { FormFieldValidate_ErrorMessagesService } from 'src/app/shared/FormFieldValidators/error-messages.service';
import { PoliciesInfo } from '../../Providers/policies.model';
import { PoliciesManagementService } from '../../Providers/policies.service';
import { APIResponseError } from 'src/app/shared/API.Response.Model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { FileUploadComponentInput } from 'src/app/shared/Components/FileUpload/file-upload.component';
import { AlertController } from '@ionic/angular';

@Component({
    selector: 'policies-audit-log',
    templateUrl: 'policies-audit-log.component.html',
    styleUrls: [
        '../../policies.page.scss'

    ]
})

export class PoliciesAuditLog_Component implements OnInit {
    constructor(
        public policiesManagementService: PoliciesManagementService,
        private _loadingService: IonicLoadingService) {
    }

    public initialized: boolean;

    @Input() policiesInfo: PoliciesInfo;


   
    

    private _init() {
        
        this.initialized = false;
    }


    ngOnInit() {
        this._init();
    }
}