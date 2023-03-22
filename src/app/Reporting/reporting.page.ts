import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { IonicLoadingService } from '../shared/Ionic.Loading.Service';
import { DNNEmbedService } from '../shared/DNN.Embed.Service';
import { ReportingProvider as ReportingProvider } from './Providers/reporting.service';
import * as ReportingModel from './Providers/reporting.model';
import { APIResponseError } from '../shared/API.Response.Model';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, AlertController, ToastController, PopoverController } from '@ionic/angular';
// tslint:disable-next-line: max-line-length
import { ActivatedRoute, Router, RouterState } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { CourseCreditDialog } from './Components/Dialogs/CourseCredit/course-credit-dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { ToastService } from '../shared/Toast.Service';

// define component
@Component({
    selector: 'app-reporting-page',
    templateUrl: 'reporting.page.html',
    styleUrls: ['reporting.page.scss'],

})

// create class for export
export class ReportingPage implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private _router: Router,
        private _modalController: ModalController,
        private _dnnEmbedService: DNNEmbedService,
        private _loadingService: IonicLoadingService,
        private _toastService: ToastService,
        public reportingProvider: ReportingProvider,
    ) {

    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/

    public initialized: boolean;

    public serverInfo: ReportingModel.ReportingServerInfo;

    public hideHeaderBackButton: boolean;

    public courses: any[];
    public filteredCourses: any[];

    public categories: any[];

    public courseInfo: any;

    public courseCardConfig: any;

    public selectedCategory: any;

    public searchFilterText: string;

    //define the list of available reports for selection
    public reportTypes: ReportingModel.ReportTypeInfo[] = [];
    public activeLink: any;
    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/
    private _sectionID: number;


    /********************************************
    * PUBLIC METHODS 
    * *******************************************/
    /**
     * [initiateReport] handles the click event on a report type card.
     * 
     * The selected report is stored and the router is directed to the correct route defined by the report object.
     * @param selectedReport 
     */
    public initiateReport(selectedReportIndex: number) {
        //match the report index with the tab index
        let selectedReportTab = this.reportTypes[selectedReportIndex];

        //Changing the routing strategy allows the router to refresh the route if the current one is selected again
        //This enables a view to be reused consecutively
        this._router.routeReuseStrategy.shouldReuseRoute = () => false;
        this._router.onSameUrlNavigation = 'reload';

        //mark the selected report 
        this._markReportAsSelected(selectedReportTab);

        //navigate to the defined route
        this._router.navigate(['reporting/' + selectedReportTab.RouteTo]);

        this.reportingProvider.selectedReport = selectedReportTab;
    };

    public onCategoryChanged(event) {
        this.selectedCategory = event;

        this.reportingProvider.categories.forEach(category => {
            if (category.CategoryID == event.CategoryID) {
                category.GUIData.IsSelected = true;
            } else {
                category.GUIData.IsSelected = false;
            }
        });
    }

    public onAddCreditBtnClick() {
        this._openAssignCreditDialog();
    }

    private async _openAssignCreditDialog() {
        //define the modal
        const modal = await this._modalController.create({
            backdropDismiss: false,
            component: CourseCreditDialog,
            componentProps: {
            },
            cssClass: 'medium-modal-pwa'
        });

        //define the actions taken when the dialog is dismissed
        modal.onDidDismiss().then((result) => {

            //if the modal was dismissed with a confirmation, destroy all datatable instances and
            //generate a brand new one with accurate data
            if (result.data.confirmed) {

                this._toastService.presentToast('External training added');
            }

        });

        //present the modal control
        return await modal.present();
    }
    /********************************************
    * PRIVATE METHODS 
    * *******************************************/
    private _markReportAsSelected(selectedReport: ReportingModel.ReportTypeInfo): void {
        //store the report selection to gather data from when routing
        this.reportingProvider.selectedReport = selectedReport;

        //mark the report as selected
        this.reportTypes.filter(report => report.GUIData.IsSelected).forEach(report => report.GUIData.IsSelected = false);
        selectedReport.GUIData.IsSelected = true;

        //clear any previous report selections (selected courses, GOs, roll calls, users, etc.)
        this.reportingProvider.resetReportConfiguration();
    }

    /**
     * [_setupReportNavigation] defines the navigation options and report parameters for the reporting tool.
     * TODO: Store these in DB?
     */
    private _setupReportNavigation() {
        this.reportTypes = [{
            Name: "Training Year Summary",
            Description: "Generate a report based on a user selection.",
            Instructions: "Click the icon under the Details column for information about each user:",
            RouteTo: "generateReport/byTrainingYearSummary",
            DataView: "byLearner",
            DisplayCourseType: "Stock",
            MaxUserSelections: 1,
            MaxCourseSelections: 1,
            RestrictCategories: false,
            DisplayCategories: [],
            IsDefault: true,
            GUIData: new ReportingModel.ReportTypeGUIData,
            TableConfig: {
                displayedColumns: [
                    'FullName',
                    'Rank',
                    'PSID',
                    'EmployeeID',
                    'CompletionPercentage',
                    'Hours',
                    'Details',
                    'Message'
                ],
                exportFileName: "TrainingYearReport_" + new Date().toString(),
                exportHeader: "Training Year Report",
                pdfLayout: 'portrait',
                exportColumnDefinitions: [
                    {
                        FriendlyName: this.reportingProvider.serverInfo.UserKeywords.One.Title.trim(),
                        TechnicalName: 'FullName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.RankKeywords.One.Title.trim(),
                        TechnicalName: 'Rank',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.PSIDKeywords.One.Title.trim(),
                        TechnicalName: 'AcadisID',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: "Employee ID",
                        TechnicalName: 'EmployeeID',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'Completion %',
                        TechnicalName: 'CompletionPercentage',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'Hours',
                        TechnicalName: 'TrainingHistoryTotalHours',
                        HideForPrint: false,
                        Datatype: 'number'
                    }
                ]
            }
        }, {
            Name: "Report by External Training",
            Description: "Generate a report based on selected courses.",
            Instructions: "Filter by training year or select a date range to refine your search.",
            RouteTo: "courseselect",
            DataView: "byExternalTraining",
            DisplayCourseType: "External Training",
            MaxUserSelections: 1,
            MaxCourseSelections: 1,
            RestrictCategories: false,
            DisplayCategories: [],
            IsDefault: false,
            GUIData: new ReportingModel.ReportTypeGUIData,
            TableConfig: {
                displayedColumns: [
                    'CourseName',
                    'LearnerName',
                    'Rank',
                    'PSID',
                    'EmployeeID',
                    'StartDate',
                    'EndDate',
                    'CompletionDate',
                    'Message'
                ],
                exportFileName: "ExternalTrainingReport_" + new Date().toString(),
                exportHeader: "External Training Report",
                pdfLayout: 'landscape',
                exportColumnDefinitions: [
                    {
                        FriendlyName: 'Course',
                        TechnicalName: 'CourseName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.UserKeywords.One.Title.trim(),
                        TechnicalName: 'LearnerName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.RankKeywords.One.Title.trim(),
                        TechnicalName: 'Rank',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.PSIDKeywords.One.Title.trim(),
                        TechnicalName: 'AcadisID',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: "Employee ID",
                        TechnicalName: 'EmployeeID',
                        HideForPrint: false,
                        Datatype: 'string'
                    }
                    ,
                    {
                        FriendlyName: "Start Date",
                        TechnicalName: 'StartDate',
                        HideForPrint: false,
                        Datatype: 'date-string'
                    }
                    ,
                    {
                        FriendlyName: "End Date",
                        TechnicalName: 'EndDate',
                        HideForPrint: false,
                        Datatype: 'date-string'
                    },
                    {
                        FriendlyName: 'Completion Date',
                        TechnicalName: 'CompletionDate',
                        HideForPrint: false,
                        Datatype: 'string'
                    }
                ]
            }
        },
        {
            Name: "Report by Courses",
            Description: "Generate a report based on selected courses.",
            Instructions: "Filter by completion status or training year to refine your search.",
            RouteTo: "courseselect",
            DataView: "byCourse",
            DisplayCourseType: "Stock",
            MaxUserSelections: 1,
            MaxCourseSelections: 1,
            RestrictCategories: false,
            DisplayCategories: [],
            IsDefault: false,
            GUIData: new ReportingModel.ReportTypeGUIData,
            TableConfig: {
                displayedColumns: [
                    'CourseName',
                    'LearnerName',
                    'Rank',
                    'GroupName',
                    'PSID',
                    'EmployeeID',
                    'StartDate',
                    'EndDate',
                    'CompletionDate',
                    'Hours',
                    'Grade',
                    'GradePercentage',
                    'Message'
                ],
                exportFileName: "CourseReport_" + new Date().toString(),
                exportHeader: "Course Report",
                pdfLayout: 'landscape',
                exportColumnDefinitions: [
                    {
                        FriendlyName: 'Course',
                        TechnicalName: 'CourseName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.UserKeywords.One.Title.trim(),
                        TechnicalName: 'LearnerName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.RankKeywords.One.Title.trim(),
                        TechnicalName: 'Rank',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'District',
                        TechnicalName: 'GroupName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.PSIDKeywords.One.Title.trim(),
                        TechnicalName: 'AcadisID',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: "Employee ID",
                        TechnicalName: 'EmployeeID',
                        HideForPrint: false,
                        Datatype: 'string'
                    }
                    ,
                    {
                        FriendlyName: "Start Date",
                        TechnicalName: 'StartDate',
                        HideForPrint: false,
                        Datatype: 'date-string'
                    }
                    ,
                    {
                        FriendlyName: "End Date",
                        TechnicalName: 'EndDate',
                        HideForPrint: false,
                        Datatype: 'date-string'
                    },
                    {
                        FriendlyName: 'Completion Date',
                        TechnicalName: 'CompletionDate',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'Hours',
                        TechnicalName: 'CourseHours',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'Grade',
                        TechnicalName: 'Grade',
                        HideForPrint: false,
                        Datatype: 'number'
                    }
                    ,
                    {
                        FriendlyName: 'Percentage',
                        TechnicalName: 'GradePercentage',
                        HideForPrint: false,
                        Datatype: 'number'
                    }
                ]
            }

        },
        {
            Name: "Report by Roll Calls",
            Description: "Generate a report based on selected roll calls.",
            Instructions: "Filter by completion status or training year to refine your search.",
            RouteTo: "courseselect",
            DataView: "byCourse",
            DisplayCourseType: "Roll Call",
            MaxUserSelections: 1,
            MaxCourseSelections: 1,
            RestrictCategories: false,
            DisplayCategories: [],
            IsDefault: false,
            GUIData: new ReportingModel.ReportTypeGUIData,
            TableConfig: {
                displayedColumns: [
                    'CourseName',
                    'LearnerName',
                    'Rank',
                    'GroupName',
                    'PSID',
                    'EmployeeID',
                    'StartDate',
                    'EndDate',
                    'CompletionDate',
                    'Grade',
                    'Message'
                ],
                exportFileName: "RollCallReport" + new Date().toString(),
                exportHeader: "Roll Call Report",
                pdfLayout: 'landscape',
                exportColumnDefinitions: [
                    {
                        FriendlyName: 'Course',
                        TechnicalName: 'CourseName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.UserKeywords.One.Title.trim(),
                        TechnicalName: 'LearnerName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.RankKeywords.One.Title.trim(),
                        TechnicalName: 'Rank',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'District',
                        TechnicalName: 'GroupName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.PSIDKeywords.One.Title.trim(),
                        TechnicalName: 'AcadisID',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: "Employee ID",
                        TechnicalName: 'EmployeeID',
                        HideForPrint: false,
                        Datatype: 'string'
                    }
                    ,
                    {
                        FriendlyName: "Start Date",
                        TechnicalName: 'StartDate',
                        HideForPrint: false,
                        Datatype: 'date-string'
                    }
                    ,
                    {
                        FriendlyName: "End Date",
                        TechnicalName: 'EndDate',
                        HideForPrint: false,
                        Datatype: 'date-string'
                    },
                    {
                        FriendlyName: 'Completion Date',
                        TechnicalName: 'CompletionDate',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'Grade',
                        TechnicalName: 'Grade',
                        HideForPrint: false,
                        Datatype: 'number'
                    },
                    {
                        FriendlyName: 'Percentage',
                        TechnicalName: 'GradePercentage',
                        HideForPrint: false,
                        Datatype: 'number'
                    }
                ]
            }
        },
        {
            Name: "Report by " + this.reportingProvider.serverInfo.PolicyKeywords.Many.Title.trim(),
            Description: "Generate a report based on selected " + this.reportingProvider.serverInfo.PolicyKeywords.Many.Lower.trim() + ".",
            Instructions: "Filter by completion status or training year to refine your search.",
            RouteTo: "generalorderselect",
            DataView: "byGeneralOrder",
            DisplayCourseType: "General Order",
            MaxUserSelections: 1,
            MaxCourseSelections: 1,
            RestrictCategories: false,
            DisplayCategories: [],
            IsDefault: false,
            GUIData: new ReportingModel.ReportTypeGUIData,
            TableConfig: {
                displayedColumns: [
                    'CourseName',
                    'LearnerName',
                    'Rank',
                    'GroupName',
                    'PSID',
                    'EmployeeID',
                    'StartDate',
                    'EndDate',
                    'Completed',
                    'Message'
                ],
                exportFileName: "PolicyReport_" + new Date().toString(),
                exportHeader: "Policy Report",
                pdfLayout: 'landscape',
                exportColumnDefinitions: [
                    {
                        FriendlyName: 'Course',
                        TechnicalName: 'CourseName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.UserKeywords.One.Title.trim(),
                        TechnicalName: 'LearnerName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.RankKeywords.One.Title.trim(),
                        TechnicalName: 'Rank',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'District',
                        TechnicalName: 'GroupName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.PSIDKeywords.One.Title.trim(),
                        TechnicalName: 'AcadisID',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: "Employee ID",
                        TechnicalName: 'EmployeeID',
                        HideForPrint: false,
                        Datatype: 'string'
                    }
                    ,
                    {
                        FriendlyName: "Start Date",
                        TechnicalName: 'StartDate',
                        HideForPrint: false,
                        Datatype: 'date-string'
                    },
                    {
                        FriendlyName: 'Completed',
                        TechnicalName: 'IsComplete',
                        HideForPrint: false,
                        Datatype: 'string'
                    }
                ]
            }
        },
        {
            Name: "Report by User",
            Description: "Generate a report based on a user selection.",
            Instructions: "Filter by completion status or training year to refine your search.",
            RouteTo: "userselect",
            DataView: "byLearner",
            DisplayCourseType: "Stock",
            MaxUserSelections: 3,
            MaxCourseSelections: 1,
            RestrictCategories: false,
            DisplayCategories: [],
            IsDefault: false,
            GUIData: new ReportingModel.ReportTypeGUIData,
            TableConfig: {
                displayedColumns: [

                    'LearnerName',
                    'Rank',
                    'GroupName',
                    'PSID',
                    'EmployeeID',
                    'CourseName',
                    'CourseType',
                    'StartDate',
                    'EndDate',
                    'Completed',
                    'CompletionDate',
                    'Hours',
                    'Grade',
                    'GradePercentage',
                    'Message'
                ],
                exportFileName: "UserReport_" + new Date().toString(),
                exportHeader: "User Report",
                pdfLayout: 'landscape',
                exportColumnDefinitions: [
                    
                    {
                        FriendlyName: this.reportingProvider.serverInfo.UserKeywords.One.Title.trim(),
                        TechnicalName: 'LearnerName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.RankKeywords.One.Title.trim(),
                        TechnicalName: 'Rank',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'District',
                        TechnicalName: 'GroupName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.PSIDKeywords.One.Title.trim(),
                        TechnicalName: 'AcadisID',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: "Employee ID",
                        TechnicalName: 'EmployeeID',
                        HideForPrint: false,
                        Datatype: 'string'
                    }
                    ,{
                        FriendlyName: 'Course',
                        TechnicalName: 'CourseName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },{
                        FriendlyName: 'Type',
                        TechnicalName: 'CourseType',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: "Start Date",
                        TechnicalName: 'StartDate',
                        HideForPrint: false,
                        Datatype: 'date-string'
                    }
                    ,
                    {
                        FriendlyName: "Is Complete",
                        TechnicalName: 'IsComplete',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: "End Date",
                        TechnicalName: 'EndDate',
                        HideForPrint: false,
                        Datatype: 'date-string'
                    },
                    {
                        FriendlyName: 'Completion Date',
                        TechnicalName: 'CompletionDate',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'Hours',
                        TechnicalName: 'CourseHours',
                        HideForPrint: false,
                        Datatype: 'string'
                    }
                    ,
                    {
                        FriendlyName: 'Grade',
                        TechnicalName: 'Grade',
                        HideForPrint: false,
                        Datatype: 'number'
                    },
                    {
                        FriendlyName: 'Percentage',
                        TechnicalName: 'GradePercentage',
                        HideForPrint: false,
                        Datatype: 'number'
                    }
                ]
            }
        },
        {
            Name: "State Report",
            Description: "NEEDS DESCRIPTION",
            Instructions: "Filter by Completion Date Range to refine your search.",
            RouteTo: "generateReport/stateReport",
            DataView: "byLearner",
            DisplayCourseType: "Stock",
            MaxUserSelections: 1,
            MaxCourseSelections: 1,
            RestrictCategories: false,
            DisplayCategories: [],
            IsDefault: false,
            GUIData: new ReportingModel.ReportTypeGUIData,
            TableConfig: {
                displayedColumns: [],
                exportFileName: "StateReport_" + new Date().toString(),
                exportHeader: "State Report",
                pdfLayout: 'landscape',
                exportColumnDefinitions: [
                    {
                        FriendlyName: this.reportingProvider.serverInfo.UserKeywords.One.Title.trim(),
                        TechnicalName: 'FullName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.RankKeywords.One.Title.trim(),
                        TechnicalName: 'Rank',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'District',
                        TechnicalName: 'GroupName',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: this.reportingProvider.serverInfo.PSIDKeywords.One.Title.trim(),
                        TechnicalName: 'AcadisID',
                        HideForPrint: false,
                        Datatype: 'string'
                    },
                    {
                        FriendlyName: 'Hours',
                        TechnicalName: 'TrainingHistoryTotalHours',
                        HideForPrint: false,
                        Datatype: 'number'
                    }
                ]
            }
        }

        ];

    }

    /*******************************************
    * SELF INIT
    *******************************************/
    private _confirmUserPermissions() {
        this.reportingProvider.canAccessReporting = this.reportingProvider.serverInfo.IsVacadManager
            || this.reportingProvider.serverInfo.IsDistrictManager
            || this.reportingProvider.serverInfo.IsHelpDesk;
    }

    private _init() {
        this._loadingService.presentLoading('Loading reports...');

        this.reportingProvider.getServerInfo().subscribe(
            (data: any) => {

                this._confirmUserPermissions();

                if (this.reportingProvider.canAccessReporting) {
                    this._setupReportNavigation();

                    //initiate the default report configuration
                    this.initiateReport(this.reportTypes.findIndex(report => report.IsDefault));
                } else {
                    //navigate to the defined route
                    this._router.navigate(['reporting/trainingReport']);
                }

                this._loadingService.dismissLoading();
                this.initialized = true;


            },
            (error: APIResponseError) => {
                console.log('reporting-error: ', error);
                this.initialized = false;
                //this.reportingErrorMessage = error.errorCode + ' - ' + error.publicResponseMessage;
                this._loadingService.dismissLoading();
            }
        );

    }

    ngOnInit() {
        this.hideHeaderBackButton = this._dnnEmbedService.getConfig().IsEmbedded;
        /**
         * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
         * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
         * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
         */
        this._dnnEmbedService.tryMessageDNNSite('ionic-loaded');

        //define course card config
        //this handles the display of sections on [CourseCardContents] component
        //TODO: define a better system for this
        this.courseCardConfig = {
            descriptionConfig: {
                showFullDescription: false
            }
        }

        this._init();
    }

    ngAfterViewInit() {

    }

}