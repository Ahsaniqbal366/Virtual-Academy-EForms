import { Component, OnInit } from '@angular/core';
import { JobTrainingProvider } from '../../Providers/Service';
import { NavController } from '@ionic/angular';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';

import { ActivatedRoute } from '@angular/router';
import { FullFormInfo } from '../../Providers/Forms.Model';
import { FormDesignerService } from './form-designer.service';

// define component
@Component({
    selector: 'jobtraining-formdesigner',
    templateUrl: 'form-designer.component.html',
    styleUrls: [
        '../../page.scss'
    ]
})

export class FormDesignerComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        public jobTrainingService: JobTrainingProvider,
        private navController: NavController,
        private loadingService: IonicLoadingService,
        public formDesignerService: FormDesignerService
    ) { }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/

    public initialized = false;

    // [defaultBackHref] set on [_init].
    public defaultBackHref: string;

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/

    // [_formID] is gathered from the route on init.
    private _formID: number;

    /*******************************************
     * PUBLIC METHODS
     *******************************************/
    segmentChanged(ev: any) {
        const programID = +this.route.snapshot.paramMap.get('programid');

        var route = '/jobtraining'
            + '/programdetail/' + programID
            + '/forms/' + this._formID
            + '/' + ev.detail.value; //[ev.detail.value] will be the selected <ion-segment> value.
        this.navController.navigateRoot(route);
    }


    public onCloseFormClick() {
        this.navController.navigateBack(this.defaultBackHref);
    }

    // public onEditFormCategoryClick(categoryInfo: FormCategoryInfo) {
    //     this.editFormCategoryDialogFactory.openEditDialog(categoryInfo).then(() => {
    //         // Submission success?
    //     })
    // }


    // public onEditFormFieldClick(fieldInfo: FormFieldInfo) {
    //     this.editFormFieldDialogFactory.openEditDialog(fieldInfo).then(() => {
    //         // Submission success?
    //     })
    // }

    /*******************************************
     * PRIVATE METHODS
     *******************************************/

    private _getForm() {
        this.jobTrainingService.getFullFormInfoForDesigner(this.jobTrainingService.selectedProgram.ProgramID, this._formID).subscribe(
            (fullFormInfo: FullFormInfo) => {
                this.formDesignerService.selectedFormInfo = fullFormInfo;
                this.initialized = true;
                this.loadingService.dismissLoading();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );

    }

    /*******************************************
     * SELF INIT
     *******************************************/
    ngOnInit() {
        this._init();
    }

    public _init() {
        this.loadingService.presentLoading('Loading form...');

        this._setBackHref();

        this._formID = +this.route.snapshot.paramMap.get('formid');

        if (!this._checkForRefresh()) {
            // retrieve the selected trainee's program data from the service provider.
            this._getForm();
        } else {
            this._onRefresh_getServerInfo();
        }
    }

    private _setBackHref() {
        const programID = +this.route.snapshot.paramMap.get('programid');
        this.defaultBackHref = '/jobtraining'
            + '/programdetail/' + programID
            + '/forms';
    }

    private _onRefresh_getServerInfo(): void {
        this.jobTrainingService.getServerInfo().subscribe(
            (serverInfo: any) => {
                this._onRefresh_getProgram();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    private _onRefresh_getProgram(): void {
        const programID = +this.route.snapshot.paramMap.get('programid');

        this.jobTrainingService.getProgram(programID).subscribe(
            (fullProgramInfo: any) => {
                this._getForm();
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    /**
     * [_checkForRefresh] - Check paramMap and/or cached data for signs of a full page refresh.
     */
    private _checkForRefresh(): boolean {
        return !this.jobTrainingService.serverInfo || !this.jobTrainingService.selectedProgram;
    }
}
