import { NgModule } from '@angular/core';

import { TraineeFormsComponent } from './trainee-forms.component';
import { TraineeFormsPopoverMenuComponent, TraineeFormsPopoverMenuFactory } from './PopoverMenu/trainee-forms.popover-menu.component';
import { AddFormDialogPage, AddFormDialogFactory } from './AddFormDialog/add-form-dialog';
import { TraineeCallLogTableComponent } from './Components/trainee-call-log-table';
import { TraineePhaseFormsTableComponent } from './Components/trainee-phase-forms-table';
import { TraineeFormsService } from './trainee-forms.service';
import { FormDetailsCanDeactivateGuard } from './Components/form-details.can-deactivate.guard';
import { TraineeFormsRoutingModule } from './trainee-forms-routing.module';
import { TraineeTaskListTableComponent } from './Components/trainee-task-list-table';
import { SharedModule } from 'src/app/shared/Shared.Module';
import { JobTrainingSharedModule } from '../../jobtraining-shared.module';
import { PDFExportService } from '../../Utilities/pdf-export.service';


@NgModule({
    imports: [
        SharedModule,
        JobTrainingSharedModule,
        TraineeFormsRoutingModule
    ],
    declarations: [
        TraineeFormsComponent,
        TraineeFormsPopoverMenuComponent,
        TraineeCallLogTableComponent,
        TraineePhaseFormsTableComponent,
        TraineeTaskListTableComponent,
        AddFormDialogPage,        
        //FormDetailsComponent,
    ],
    entryComponents: [
        TraineeFormsPopoverMenuComponent,
        AddFormDialogPage
    ],
    providers: [
        AddFormDialogFactory,
        TraineeFormsPopoverMenuFactory,
        TraineeFormsService,
        FormDetailsCanDeactivateGuard,
        PDFExportService
    ]
})
export class TraineeFormsModule { }
