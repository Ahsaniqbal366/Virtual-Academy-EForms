import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Reporting_TrainerLikertSummaryComponent } from './StockReports/trainer-likert-summary.component';
import { ReportsComponent } from './reports.component';
import { Reporting_TraineeScoreTrendComponent } from './StockReports/trainee-score-trend.component';
import { Reporting_CallLogHistoryComponent } from './StockReports/call-log-history.component';
import { Reporting_TrainerTraineePairingHistoryComponent } from './StockReports/trainer-trainee-pairing-history.component';


const routes: Routes = [
    {
        path: '',
        component: ReportsComponent,
        children: [
            {
                path: 'trainerlikertsummary',
                component: Reporting_TrainerLikertSummaryComponent,
            },
            {
                path: 'traineescoretrend',
                component: Reporting_TraineeScoreTrendComponent,
            },
            {
                path: 'callloghistory',
                component: Reporting_CallLogHistoryComponent,
            },            
            {
                path: 'trainertraineepairinghistory',
                component: Reporting_TrainerTraineePairingHistoryComponent,
            },
            
            // {
            //     path: 'custom/:reportid',
            //     component: ProgramUsersComponent
            // }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportingRoutingModule { }
