import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { ReportingPage } from './reporting.page';

import { SharedModule } from '../shared/Shared.Module';
import { DataTablesModule } from 'angular-datatables'

import { ReportingProvider } from './Providers/reporting.service';
import { MessageCenterProvider } from 'src/app/MessageCenter/Providers/message-center.service'

import { ReportingCourseSelect } from './Views/CourseSelect/course-select'
import { ReportingGeneralOrderSelect } from './Views/GeneralOrderSelect/general-order-select'
import { ReportingUserSelect } from './Views/UserSelect/user-select'
import { ReportParameters } from './Components/report-parameters'

import { ReportingResult } from './Views/ReportResultView/report-result.component'
import { ReportingResultByCourse } from './Views/ReportResultView/ByCourse/report-result-bycourse.component'
import { ReportingResultByLearner } from './Views/ReportResultView/ByLearner/report-result-bylearner.component'
import { ReportingResultByIndividual } from './Views/ReportResultView/ByLearner/report-result-byindividual.component'
import {ReportingResultByTrainingYear} from './Views/ReportResultView/ByTrainingYear/report-result-by-training-year.component'
import { AcadisReportingResult } from './Views/ReportResultView/AcadisReport/acadis-reporting-result.component'
import { SendMessageDialog } from './Components/Dialogs/send-message-dialog';
import { CourseCreditDialog } from './Components/Dialogs/CourseCredit/course-credit-dialog';
import { ViewCourseCreditDetailsDialog } from './Components/Dialogs/CourseCredit/view-course-credit-details-dialog';
import { AddCreditTypeDialog } from './Components/Dialogs/CourseCredit/add-credit-type-dialog';
import { SeeMoreDialog } from './Components/Dialogs/SeeMore/see-more-dialog';
import { ReportParametersDialog } from './Components/Dialogs/ReportParameters/report-parameters-dialog';
import { PDFExportService } from '../Reporting/Providers/pdf-export.service';

import {CourseSelectModule} from 'src/app/shared/Components/CourseSelect/courseselect.module';

// define routes
const routes: Routes = [
    {
        path: '',
        component: ReportingPage,
        children: [{
            path: 'courseselect',
            component: ReportingCourseSelect
        },
        {
            path: 'userselect',
            component: ReportingUserSelect
        },
        {
            path: 'generalorderselect',
            component: ReportingGeneralOrderSelect
        },
        {
            path: 'trainingReport',
            component: ReportingResultByIndividual
        },
        {
            path: 'generateReport/byCourse',
            component: ReportingResultByCourse
        },
        {
            path: 'generateReport/byExternalTraining',
            component: ReportingResultByCourse
        },
        {
            path: 'generateReport/byLearner',
            component: ReportingResultByCourse
        },
        {
            path: 'generateReport/byGeneralOrder',
            component: ReportingResultByCourse
        },
        {
            path: 'generateReport/byTrainingYearSummary',
            component: ReportingResultByTrainingYear
        },
        {
            path: 'generateReport/stateReport',
            component: AcadisReportingResult
        }]
    }



];

// define module
@NgModule({
    imports: [
        RouterModule.forChild(routes),
        DataTablesModule,
        CourseSelectModule,
        SharedModule
    ],
    declarations: [
        // Pages
        ReportingPage,
        // Components
        ReportingCourseSelect,
        ReportingUserSelect,
        ReportingGeneralOrderSelect,
        ReportingResult,
        ReportingResultByCourse,
        ReportingResultByLearner,
        ReportingResultByIndividual,
        ReportingResultByTrainingYear,
        AcadisReportingResult,
        ReportParameters,
        // Dialogs
        SendMessageDialog,
        CourseCreditDialog,
        ViewCourseCreditDetailsDialog,
        AddCreditTypeDialog,
        SeeMoreDialog,
        ReportParametersDialog
        // Popovers
    ],
    entryComponents: [
        // Dialogs 
        // Popovers
    ],
    providers: [
        ReportingProvider,
        MessageCenterProvider,
        PDFExportService
    ],
    exports: [RouterModule]
})

// export entire module
export class ReportingPageModule { }
