// https://angular.io/guide/sharing-ngmodules
import { NgModule } from '@angular/core';
import { StatusCellComponent } from './Components/StatusCell/status-cell';
import { ScoreCellComponent } from './Components/ScoreCell/score-cell';
import { TrendCellComponent } from './Components/TrendCell/trend-cell';
import { SignatureCellComponent } from './Components/SignatureCell/signature-cell';
import { MarkedFieldsCellComponent } from './Components/MarkedFieldsCell/marked-fields-cell';
import { SharedModule } from '../shared/Shared.Module';
import { ArchivedProgramHeaderComponent } from './Components/ArchivedProgramHeader/archived-program-header.component';
import { FormDisplayComponent } from './Components/FormDisplay/form-display.component';
import { ReportTableComponent } from 'src/app/JobTraining/Components/ReportTable/report-table.component';
import { JTUserSelectorComponent, JTUserSelectorFilterPipe } from 'src/app/JobTraining/Components/UserSelector/jt-user-selector.component';


@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [
        // Components
        StatusCellComponent,
        ScoreCellComponent,
        TrendCellComponent,
        SignatureCellComponent,
        MarkedFieldsCellComponent,
        ArchivedProgramHeaderComponent,
        FormDisplayComponent,
        ReportTableComponent,
        JTUserSelectorComponent,
        JTUserSelectorFilterPipe
    ],
    exports: [
        // Components
        StatusCellComponent,
        ScoreCellComponent,
        TrendCellComponent,
        SignatureCellComponent,
        MarkedFieldsCellComponent,
        ArchivedProgramHeaderComponent,
        FormDisplayComponent,
        ReportTableComponent,
        JTUserSelectorComponent,
    ]
})
export class JobTrainingSharedModule {
}
