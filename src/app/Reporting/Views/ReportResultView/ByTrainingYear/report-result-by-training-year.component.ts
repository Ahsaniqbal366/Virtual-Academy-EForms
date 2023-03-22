import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { LoadingService } from '../../../../shared/Loading.Service';
import { DNNEmbedService } from '../../../../shared/DNN.Embed.Service';

import { ReportingProvider as ReportingProvider } from '../../../Providers/reporting.service';
import * as ReportingModel from '../../../Providers/reporting.model';

import { SendMessageDialog } from '../../../Components/Dialogs/send-message-dialog';
import { CourseCreditDialog } from '../../../Components/Dialogs/CourseCredit/course-credit-dialog';
import { AddCreditTypeDialog } from '../../../Components/Dialogs/CourseCredit/add-credit-type-dialog';
import { SeeMoreDialog } from '../../../Components/Dialogs/SeeMore/see-more-dialog';

import { HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { CourseInfo } from 'src/app/shared/Components/CourseSelect/Providers/courseselect.model';
import { PDFExportService } from 'src/app/Reporting/Providers/pdf-export.service';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';

// define component
@Component({
    selector: 'report-result-by-training-year',
    templateUrl: 'report-result-by-training-year.component.html',
    styleUrls: ['../../../reporting.page.scss'],

})

// create class for export
export class ReportingResultByTrainingYear implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private location: Location,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: LoadingService,
        private modalController: ModalController,
        private alertController: AlertController,
        public reportingProvider: ReportingProvider,
        private _pdfExportService: PDFExportService,
        private _filterPipe: GenericFilterPipe
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;
    public isSearching: boolean;

    public hideHeaderBackButton: boolean;
    public searchTextboxInputValue: string;

    //the report table data source and column definitions
    public unfilteredReportData: any = [];
    public reportTableDataSource: any = [];
    public totalRecordCount: number = 0;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) reportTablePaginator: MatPaginator;

    public reportTableProperties: any;

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/


    /********************************************
    * PUBLIC METHODS 
    * *******************************************/

    /**
     * [onBackBtnClick] defines the behaviour for the back button in the header of the report results page
     */
    public onBackBtnClick() {
        this.location.back();
    }

    public onMessageBtnClick(recordInfo: any) {
        this._openSendMessageDialog(recordInfo.LearnerName || recordInfo.FullName, recordInfo.UserID)
    }

    public onDetailBtnClick(recordInfo: any) {
        this._openSeeMoreDialog(recordInfo);
    }

    /**
     * [onPrintTableBtnClick] is triggered when the user clicks the 'Print' button on the report result table
     */
    public onPrintTableBtnClick() {
        this._printReport();
    }

    /**
     * [onExportTableBtnClick] is triggered when the user clicks the 'Export' button on the report result table
     */
    public onExportTableBtnClick() {
        this._exportReport();
    }

    /**
     * [reportSortChange] is triggered when any of the mat-table sort headers are clicked
     */
    public reportSortChange(sort: Sort) {
        const data = this.reportTableDataSource.data.slice();

        if (!sort.active || sort.direction === '') {
            this.reportTableDataSource.data = data;
            return;
        }

        this.reportTableDataSource.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'CourseName':
                    return this._filterPipe.compare(a.CourseName, b.CourseName, isAsc);
                case 'CourseType':
                    return this._filterPipe.compare(a.CourseType, b.CourseType, isAsc);
                case 'LearnerName':
                    return this._filterPipe.compare(a.LearnerName, b.LearnerName, isAsc);
                case 'FullName':
                    return this._filterPipe.compare(a.FullName, b.FullName, isAsc);
                case 'Rank':
                    return this._filterPipe.compare(a.Rank, b.Rank, isAsc);
                case 'PSID':
                    return this._filterPipe.compare(a.AcadisID, b.AcadisID, isAsc);
                case 'EmployeeID':
                    return this._filterPipe.compare(a.EmployeeID, b.EmployeeID, isAsc);
                case 'StartDate':
                    return this._filterPipe.compare(a.StartDate, b.StartDate, isAsc);
                case 'EndDate':
                    return this._filterPipe.compare(a.EndDate, b.EndDate, isAsc);
                case 'CompletionDate':
                    return this._filterPipe.compare(a.CompletionDate, b.CompletionDate, isAsc);
                case 'Grade':
                    return this._filterPipe.compare(a.Grade, b.Grade, isAsc);
                case 'CompletionPercentage':
                        return this._filterPipe.compare(a.TrainingHistoryCompletionPercentage, b.TrainingHistoryCompletionPercentage, isAsc);
                case 'Hours':
                    return this._filterPipe.compare(a.TrainingHistoryTotalHours, b.TrainingHistoryTotalHours, isAsc);
                case 'IsComplete':
                        return this._filterPipe.compare(a.isComplete, b.isComplete, isAsc);
                default:
                    return 0;
            }
        });
    }

    /**
     * [setFilteredRecords] filters the data set based on the search box input
     */
    public setFilteredRecords() {
        this.isSearching = true;

        this.reportTableDataSource.data = this._filterPipe.transform(this.unfilteredReportData, { text: this.searchTextboxInputValue });

        this.isSearching = false;
    }

    public applyFilters(){
        this.loadingService.presentLoading('Applying filters...');

        this._generateReport();
    }

    /********************************************
    * PRIVATE METHODS 
    * *******************************************/

    /**
     * [_setupReportTable] assigns the datasource and paginator component to the output table
     */
    private _setupReportTable(reportData: any) {
        // sort the data by FullName by default
        reportData.sort((a, b) => (b.FullName.toUpperCase() > a.FullName.toUpperCase() ? -1 : 1));

        this.reportTableDataSource = new MatTableDataSource(reportData);

        this.reportTableDataSource.sort = this.sort;
        this.reportTableDataSource.paginator = this.reportTablePaginator;
        this.totalRecordCount = reportData.length;
    }

    /**
     * [_printReport] uses [PDFExportService] to generate a PDF export of the visible report rows
     */
    private _printReport() {
        let tableConfig = this.reportTableProperties;

        // use PDFMake to generate a PDF for the visible table data
        let pdfExportService = new PDFExportService();
        pdfExportService.exportMatTableToPDF(tableConfig.exportHeader, tableConfig.pdfLayout, tableConfig.exportColumnDefinitions, this.reportTableDataSource);
    }

    /**
     * [_exportReport] uses [PDFExportService] to generate a CSV export of the visible report rows
     */
    private _exportReport() {
        let tableConfig = this.reportTableProperties;

        // use PDFMake to generate a PDF for the visible table data
        let pdfExportService = new PDFExportService();
        pdfExportService.exportMatTableToCSV(tableConfig.exportFileName, tableConfig.exportColumnDefinitions, this.reportTableDataSource);
    }

    /**
     * [_generateReport] requests that the provider issue an API call to generate the report details.
     * 
     * The Datatable instance is not declared until this point because once the [dtOptions] are declared, it will try to render the table.
     * To prevent this from happening, the page is left in an unitialized state until the process is complete and the table is ready to be rendered.
     */
    private _generateReport(): void {
        //API request to get report data
        this.reportingProvider.generateTrainingHistorySummaryReport().subscribe((reportData: any) => {

            this.unfilteredReportData = JSON.parse(reportData).data;
            this.reportTableProperties = this.reportingProvider.selectedReport.TableConfig;

            this._setupReportTable(this.unfilteredReportData);

            //once the process has completed successfully, dismiss loading and show the page
            this.loadingService.dismissLoading();
            this.initialized = true;
        },
            (error) => {
                console.log('reporting-error: ', error);
                this.loadingService.dismissLoading();
                this.initialized = false;
            }
        );

    }

    private async _openSendMessageDialog(learnerName: string, userID: number) {
        //define the modal
        const modal = await this.modalController.create({
            backdropDismiss: false,
            component: SendMessageDialog,
            componentProps: {
                LearnerName: learnerName,
                SendToLearnerID: userID
            }
        });

        //define the actions taken when the dialog is dismissed
        modal.onDidDismiss().then((result) => {


        });

        //present the modal control
        return await modal.present();
    }

    private async _openSeeMoreDialog(rowData: any) {
        //define the modal
        const modal = await this.modalController.create({
            backdropDismiss: false,
            component: SeeMoreDialog,
            componentProps: {
                LearnerInformation: rowData
            },
            cssClass: 'medium-modal-pwa'
        });

        //define the actions taken when the dialog is dismissed
        modal.onDidDismiss().then((result) => {


        });

        //present the modal control
        return await modal.present();
    }



    /*******************************************
    * SELF INIT
    *******************************************/
    ionViewWillEnter() {
        this._init();
    }


    private async _init() {
        await this.loadingService.presentLoading('Loading...');


    }


    ngOnInit() {
        this.initialized = false;
        this.hideHeaderBackButton = this.dnnEmbedService.getConfig().IsEmbedded;
        /**
         * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
         * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
         * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
         */
        this.dnnEmbedService.tryMessageDNNSite('ionic-loaded');

        this._generateReport();
    }
}