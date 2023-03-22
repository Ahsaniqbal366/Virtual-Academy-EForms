import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';
import { LoadingService } from '../../../../shared/Loading.Service';
import { DNNEmbedService } from '../../../../shared/DNN.Embed.Service';
import { ReportingProvider as ReportingProvider } from '../../../Providers/reporting.service';
import { PDFExportService } from 'src/app/Reporting/Providers/pdf-export.service';

// define component
@Component({
    selector: 'report-result-byindividual',
    templateUrl: 'report-result-byindividual.component.html',
    styleUrls: ['../../../reporting.page.scss'],

})

// create class for export
export class ReportingResultByIndividual implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private location: Location,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: LoadingService,
        public reportingProvider: ReportingProvider
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;

    public hideHeaderBackButton: boolean;

    //data table instances for allreports
    public dtInstances: any = [];
    public tableExportConfigurations: any[] = [];


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

    /**
     * [toggleDTVisibility] toggles the visibility of a given DT instance row
     */
    public toggleDTVisibility(dtInstance: any) {
        dtInstance.Visibility = !dtInstance.Visibility;
    }

    /**
     * [applyFilters] generates the given report with the parameters set from the [report-parameters]
     * component
     */
    public applyFilters() {
        this.loadingService.presentLoading('Applying filters...');

        this._generateReport();
    }

    /**
   * [printCollatedSummary] will generate a collated PDF file using PDFMake based on the provided table data
   */
    public printCollatedSummary() {
        // use PDFMake to generate a PDF for the visible table data
        let pdfExportService = new PDFExportService();

        // generate the PDF
        pdfExportService.exportDataTableListToPDF("Training Summary Report", "landscape", this.tableExportConfigurations);
    }

    /********************************************
    * PRIVATE METHODS 
    * *******************************************/

    /**
     * [_buildDTOptions] creates a new object defining particular datatable assets for the current view
     * @param tableData - The data that will be used in the Datatable
     */
    private _buildDTOptions(tableData: any, exportFileName: string, printHeader: string): {} {
        let columns = [{
            title: 'Course Name',
            data: 'CourseName',
            className: ''
        },
        {
            title: 'Start Date',
            data: 'StartDate',
            className: ''
        },
        {
            title: 'End Date',
            data: 'EndDate',
            className: ''
        },

        {
            title: 'Completion Date',
            data: 'CompletionDate',
            className: ''
        },
        {
            title: 'Score',
            data: 'Grade',
            className: ''
        }];

        // define and store the PDF export properties for the table
        this.tableExportConfigurations.push({
            TableHeader: printHeader,
            TableColumns: columns,
            TableData: tableData
        });

        return {
            data: tableData,
            'processing': true,
            'pageLength': 50,
            'language': {
                'loadingRecords': 'Loading...',
                'processing': 'Loading...',
                search: "_INPUT_",
                searchPlaceholder: "Search"
            },
            columns: columns,
            // Declare the use of the extension in the dom parameter
            dom: 'Bfrtip',
            // Configure the buttons
            buttons: [

                {
                    text: 'Export',
                    action: function (e, dt, node, config) {
                        // datatable data will need to be gathered from the filtered/searched list
                        // when preparing for print and export
                        var dataToExport = [];

                        dt.rows({ order: 'current', search: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                            var row = dt.row(rowIdx);
                            dataToExport.push(row.data());
                        });

                        // use PDFMake to generate a PDF for the visible table data
                        let pdfExportService = new PDFExportService();
                        pdfExportService.exportDataTableToCSV(printHeader, columns, dataToExport);
                    }
                },
                {
                    /**
                     * Customized Datatables Print
                     */
                    text: "Print",
                    action: function (e, dt, node, config) {
                        // datatable data will need to be gathered from the filtered/searched list
                        // when preparing for print and export
                        var dataToExport = [];

                        dt.rows({ order: 'current', search: 'applied' }).every(function (rowIdx, tableLoop, rowLoop) {
                            var row = dt.row(rowIdx);
                            dataToExport.push(row.data());
                        });

                        // use PDFMake to generate a PDF for the visible table data
                        let pdfExportService = new PDFExportService();
                        pdfExportService.exportDatatableToPDF(printHeader, null, columns, dataToExport);

                    }
                }


            ]
        };


    }

    /**
     * [_generateReport] requests that the provider issue an API call to generate the report details.
     * 
     * The Datatable instance is not declared until this point because once the [dtOptions] are declared, it will try to render the table.
     * To prevent this from happening, the page is left in an unitialized state until the process is complete and the table is ready to be rendered.
     */
    private _generateReport(): void {
        // empty instance list
        this.dtInstances = [];

        //API request to get report data
        this.reportingProvider.generateReport().subscribe((reportData: any) => {


            //define a new DT instance
            let dtInstance: any = {};

            //define datatable instance data for each [CourseType]
            dtInstance.StockCourseData = {};
            dtInstance.RollCallCourseData = {};
            dtInstance.GeneralOrderCourseData = {};
            dtInstance.ExternalTrainingCourseData = {};

            //filter the course report data based on userID
            let filteredReportData = reportData;

            //define the DT options based on the filtered data for each [CourseType]
            dtInstance.StockCourseData.dtOptions = this._buildDTOptions(filteredReportData.filter(data => data.CourseType == "Stock"),
                'CourseReport_' + new Date().toString(),
                'Course Report');

            dtInstance.RollCallCourseData.dtOptions = this._buildDTOptions(filteredReportData.filter(data => data.CourseType == "Roll Call"),
                'RollCallReport_' + new Date().toString(),
                'Roll Call Report');

            dtInstance.GeneralOrderCourseData.dtOptions = this._buildDTOptions(filteredReportData.filter(data => data.CourseType == "General Order"),
                'PolicyReport_' + new Date().toString(),
                'Policy Report');

            dtInstance.ExternalTrainingCourseData.dtOptions = this._buildDTOptions(filteredReportData.filter(data => data.CourseType == "External Training"),
                'ExternalTrainingReport_' + new Date().toString(),
                'External Training Report');

            //add the instance to the list of available DT instances
            this.dtInstances.push(dtInstance)


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