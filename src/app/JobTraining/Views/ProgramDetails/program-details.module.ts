import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';
import { JobTrainingSharedModule } from '../../jobtraining-shared.module';
import { ProgramTraineePopoverMenuComponent } from './ProgramTrainees/PopoverMenu/program-trainees.popover-menu.component';
import { AddProgramUserDialogFactory, AddProgramUserDialog } from './AddProgramUserDialog/add-program-user-dialog';
import { ProgramDetailsRoutingModule } from './program-details-routing.module';
import { ProgramTraineesComponent } from './ProgramTrainees/program-trainees.component';
import { ProgramDetailComponent } from './program-detail';
import { ProgramDetails404Component } from './temp404-component';
import { ProgramUsersComponent } from './ProgramUsers/program-users.component';
import { ProgramUserPopoverMenuComponent, ProgramUserPopoverMenuFactory } from './ProgramUsers/PopoverMenu/program-users.popover-menu.component';
import { ProgramFormsComponent } from './ProgramForms/program-forms.component';
import { ProgramAdminToDoComponent } from '../ProgramAdminToDo/program-admin-to-do.component';
import { FormDetailsComponent } from '../TraineeForms/Components/form-details';
import { FormDetailsCanDeactivateGuard } from '../TraineeForms/Components/form-details.can-deactivate.guard';
import { TraineeFormsService } from '../TraineeForms/trainee-forms.service';
import { PDFExportService } from '../../Utilities/pdf-export.service';
import { ReportsListComponent } from './ReportsList/reports-list.component';


@NgModule({
    imports: [
        SharedModule,
        JobTrainingSharedModule,
        ProgramDetailsRoutingModule
    ],
    declarations: [
        // Components
        ProgramDetailComponent,
        AddProgramUserDialog,

        // Components - ProgramAdminToDo
        ProgramAdminToDoComponent,

        // Components - ProgramTrainees
        ProgramTraineesComponent,        
        ProgramTraineePopoverMenuComponent,        

        // Components - ProgramUsers
        ProgramUsersComponent,
        ProgramUserPopoverMenuComponent,        

        // Components - ProgramForms
        ProgramFormsComponent,

        // Components - ProgramAdminToDo
        ProgramAdminToDoComponent,

        // Components - General
        ProgramDetails404Component,

        FormDetailsComponent,

        ReportsListComponent
        
    ],
    entryComponents: [
        AddProgramUserDialog,

        // Components - ProgramTrainees
        ProgramTraineePopoverMenuComponent,        

        // Components - ProgramUsers
        ProgramUserPopoverMenuComponent
    ],
    providers: [
        AddProgramUserDialogFactory,        

        // Components - ProgramUsers
        ProgramUserPopoverMenuFactory,

        // Pull this into the module so all "child" components can use it.
        PDFExportService,
        TraineeFormsService,
        FormDetailsCanDeactivateGuard,
    ]
})
export class ProgramDetailsModule { }
