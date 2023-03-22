import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';
import { JobTrainingSharedModule } from 'src/app/JobTraining/jobtraining-shared.module';

import { NgChartsModule } from 'ng2-charts';

import { ReportsComponent } from './reports.component';
import { ReportingRoutingModule } from './reports-routing.module';
import { Reporting_TrainerLikertSummaryComponent } from './StockReports/trainer-likert-summary.component';
import { Reporting_TraineeScoreTrendComponent } from './StockReports/trainee-score-trend.component';
import { Reporting_CallLogHistoryComponent } from './StockReports/call-log-history.component';
import { Reporting_TrainerTraineePairingHistoryComponent } from './StockReports/trainer-trainee-pairing-history.component';

@NgModule({
    imports: [
        SharedModule,
        JobTrainingSharedModule,
        ReportingRoutingModule,
        NgChartsModule
    ],
    declarations: [
        // Components
        ReportsComponent,
        Reporting_TrainerLikertSummaryComponent,
        Reporting_TraineeScoreTrendComponent,
        Reporting_CallLogHistoryComponent,
        Reporting_TrainerTraineePairingHistoryComponent
    ],
    entryComponents: [
    ],
    providers: [
    ]
})
export class ReportsModule { }