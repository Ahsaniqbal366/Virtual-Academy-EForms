import { Component, OnInit, ViewEncapsulation, Pipe, PipeTransform } from '@angular/core';
import { LoadingService } from '../../../shared/Loading.Service';
import { DNNEmbedService } from '../../../shared/DNN.Embed.Service';
import { ReportingProvider as ReportingProvider } from '../../Providers/reporting.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import * as ReportingModel from '../../Providers/reporting.model';
import * as CourseInfoModel from '../../../shared/Components/CourseSelect/Providers/courseselect.model';
import { APIResponseError } from '../../../shared/API.Response.Model';

import { CourseCreditDialog } from '../../Components/Dialogs/CourseCredit/course-credit-dialog';

// tslint:disable-next-line: max-line-length
import { ActivatedRoute, Router } from '@angular/router';
import { FilterCoursesPipe } from 'src/app/shared/Components/CourseSelect/CourseCardContents/courseselect.course-card-contents';
import { ModalController, AlertController } from '@ionic/angular';
import { ReportParametersDialog } from '../../Components/Dialogs/ReportParameters/report-parameters-dialog';

// define component
@Component({
    selector: 'reporting-course-select',
    templateUrl: 'course-select.html',
    styleUrls: ['../../reporting.page.scss'],

})

// create class for export
export class ReportingCourseSelect implements OnInit {
    // constructor -- define service provider
    // The service provider will persist along routes
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dnnEmbedService: DNNEmbedService,
        private loadingService: LoadingService,
        public reportingProvider: ReportingProvider,
        private modalController: ModalController,
        private _alertController: AlertController
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public initialized: boolean;

    public serverInfo: ReportingModel.ReportingServerInfo;

    public hideHeaderBackButton: boolean;

    //configuration for the data used in the course card repeater
    public courseCardConfig: any;

    //the currently selected course category
    public selectedCategories: any;

    //search text input variable
    public searchFilterText: string;

    //model for the 'Select All Courses' checkbox
    public selectAllCourses: boolean = false;

    public formControl = new FormControl();

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/


    /********************************************
    * PUBLIC METHODS 
    * *******************************************/

    public onAddCreditBtnClick() {
        this._openAssignCreditDialog();
    }

    /**
     * [onSelectAllCoursesClick] defines the click event of the select all courses checkbox
     */
    public onSelectAllCoursesClick() {

        new FilterCoursesPipe().transform(this.reportingProvider.courses, [{ filterText: this.searchFilterText, selectedCategories: this.selectedCategories }])
            .forEach(course => {
                if (!this.selectAllCourses) {
                    course.GUIData.IsSelected = true;
                } else {
                    course.GUIData.IsSelected = false;
                }


            });
    }

    /**
     * [onGenerateReportBntClick] defines the behaviour of the 'Generate' button
     * 
     * When clicked, the list of selected courses is filtered by all selected and the course IDs are mapped into an array to be used by the
     * Reporting API.
     */
    public onGenerateReportBtnClick() {
        let dataView = this.reportingProvider.selectedReport.DataView;

        if (this.reportingProvider.selectedCourses.length > 0) {
            //navigate to the report datatable view, which will trigger a request to the Reporting API to generate the report
            this.router.navigate(['reporting/generateReport/' + dataView]);
        } else {
            this._alertController.create({
                header: "Cannot Generate Report",
                message:
                    "No courses have been selected.",
                buttons: [
                    {
                        text: "OK",
                        role: "cancel",
                    }

                ],
            })
                .then((alertEl) => {
                    alertEl.present();
                });
        }

    }

    public onOpenReportParametersClick() {
        this._openReportParametersDialog();
    }

    /**
     * [onCategoryChanged] defines the behaviour of clicking a Category tab.
     * 
     * The [selectedCategory] is changed to reflect the selection and the GUIData is modified to reflect the selection as well.
     * @param event 
     */
    public onCategoryChanged(event) {
        //change the selected category
        this.selectedCategories = event;

        //clear previously selected categories and mark the currently selected one
        //if the category is an external training category, the logic must work around the ALL category having the same empty ID
        if (event.DisplayExternalTraining) {
            this.reportingProvider.categories.forEach(category => {
                if (category.CategoryID == event.CategoryID && category.DisplayExternalTraining) {
                    category.GUIData.IsSelected = true;
                } else {
                    category.GUIData.IsSelected = false;
                }
            });
        } else {
            this.reportingProvider.categories.forEach(category => {
                if (category.CategoryID == event.CategoryID && !category.DisplayExternalTraining) {
                    category.GUIData.IsSelected = true;
                } else {
                    category.GUIData.IsSelected = false;
                }
            });
        }

    }

    public mapSelectedCourses($event): void{
        //parse the list of selected courses to get a list of selected course IDs.
        this.reportingProvider.selectedCourses = $event;
        this.reportingProvider.selectedCourseIDs = this.reportingProvider.selectedCourses.filter(course => !course.IsExternalTrainingCourse).map(course => course.SNPCourseID);
        this.reportingProvider.selectedExternalTrainingCourseIDs = this.reportingProvider.selectedCourses.filter(course => course.IsExternalTrainingCourse).map(course => course.SNPCourseID);
    }

    /********************************************
    * PRIVATE METHODS 
    * *******************************************/

    /**
     * Map the course data returned from the API.
     * @param courses
     */
    private _setupCourses(courses: any[]) {
        this.reportingProvider.courses = courses.map((courseInfo: CourseInfoModel.CourseInfo) => {

            //initialize the GUIData object for each course
            courseInfo.GUIData = new CourseInfoModel.CourseInfoGUIData;

            return courseInfo;
        });
    }

    /**
     * Map the category data returned from the API.
     * @param courseCategories
     */
    private _setupCourseCategories(courseCategories: any[]) {
        this.reportingProvider.categories = courseCategories.map((categoryInfo: CourseInfoModel.CourseCategoryInfo) => {

            //initialize the GUIData object for each category
            categoryInfo.GUIData = new CourseInfoModel.CourseCategoryGUIData;
            //if the course category has no child courses, do not show the category at all
            categoryInfo.GUIData.ShowTab = categoryInfo.HasCourses;

            return categoryInfo;
        });

        //if there are any categories that need to be selectively taken out based on report definitions,
        //do so now
        if (this.reportingProvider.selectedReport.RestrictCategories) {
            var categoriesToFilter = this.reportingProvider.selectedReport.DisplayCategories;

            this.reportingProvider.categories = this.reportingProvider.categories.filter(category =>
                categoriesToFilter.indexOf(category.CategoryName) >= 0);
        }

        //select first category
        this.selectedCategories = [];
    }


    private async _openAssignCreditDialog() {
        //define the modal
        const modal = await this.modalController.create({
            backdropDismiss: false,
            component: CourseCreditDialog,
            componentProps: {
            },
            cssClass: 'medium-modal-pwa'
        });

        //define the actions taken when the dialog is dismissed
        modal.onDidDismiss().then((result) => {
            if (result.data.confirmed) {
                this._init();
            }

        });

        //present the modal control
        return await modal.present();
    }

    /**
     * [_openReportParametersDialog] opens the report parameter dialog
     * to allow the user to modify report filtering
     */
    private async _openReportParametersDialog() {
        //define the modal
        const modal = await this.modalController.create({
            backdropDismiss: false,
            component: ReportParametersDialog,
            componentProps: {
            },
            cssClass: 'small-modal-pwa'
        });

        //define the actions taken when the dialog is dismissed
        modal.onDidDismiss().then((result) => {
            if (result.data.confirmed) {

            }

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
        await this.loadingService.presentLoading('Loading courses...');

        this.initialized = true;
        this.loadingService.dismissLoading();


    }

    ngOnInit() {
        this.hideHeaderBackButton = this.dnnEmbedService.getConfig().IsEmbedded;
        /**
         * The Ionic app can be embedded in an <iframe> on the DNN site. Check for that case now.
         * We really only need to run [tryMessageDNNSite] on the main app/component ngInit.
         * It will post a message out to the DNN site so the DNN site can will know ionic has loaded.
         */
        this.dnnEmbedService.tryMessageDNNSite('ionic-loaded');

        //define course card config
        //this handles the display of sections on [CourseCardContents] component
        //TODO: define a better system for this
        this.courseCardConfig = {
            CourseDescriptionConfig: {
                ShowDescriptionButton: false,
                ShowFullDescription: false
            }
        }

        this._init();
    }
}