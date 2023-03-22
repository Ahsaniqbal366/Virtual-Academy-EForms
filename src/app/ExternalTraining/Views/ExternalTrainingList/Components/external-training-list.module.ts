import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';

// Components
import {ExternalTrainingList_Component} from 'src/app/ExternalTraining/Views/ExternalTrainingList/Components/external-training-list.component';
import {ExternalTrainingListRoutingModule} from 'src/app/ExternalTraining/Views/ExternalTrainingList/Components/external-training-list-routing.module';
import {ExternalTrainingDetails_Component} from 'src/app/ExternalTraining/Components/external-training-details.component';
import {ExternalTrainingRoster_Component} from 'src/app/ExternalTraining/Components/external-training-roster.component'

// Dialogs
import { ExternalTraining_AddExternalTrainingDialog_Component, ExternalTraining_AddExternalTrainingDialog_Factory } from 'src/app/ExternalTraining/Components/Dialogs/add-new-external-training.dialog'; 
import { ExternalTraining_ArchiveExternalTrainingDialog_Factory, ExternalTraining_ArchiveExternalTrainingDialog_Component } from 'src/app/ExternalTraining/Components/Dialogs/archive-external-training.dialog';
import { ExternalTraining_AddUserCreditDialog_Factory, ExternalTraining_AddUserCreditDialog_Component } from 'src/app/ExternalTraining/Components/Dialogs/add-user-credit.dialog';


//Popovers
import { ExternalTrainingTablePopoverMenuComponent } from 'src/app/ExternalTraining/Components/Popovers/external-training-table.popover-menu.component';
// Services
import { ExternalTrainingService } from 'src/app/ExternalTraining/Providers/external-training.service';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';
import { CertificationPDFExportService } from 'src/app/ExternalTraining/Providers/external-training-pdf-export.service';


@NgModule({
    imports: [
        SharedModule,
        ExternalTrainingListRoutingModule
    ],
    declarations: [
        ExternalTrainingList_Component,
        ExternalTrainingDetails_Component,
        ExternalTrainingRoster_Component,
        // Dialogs
        ExternalTraining_AddExternalTrainingDialog_Component,
        ExternalTraining_ArchiveExternalTrainingDialog_Component,
        ExternalTraining_AddUserCreditDialog_Component,
        // Popovers
        ExternalTrainingTablePopoverMenuComponent
    ],
    entryComponents: [
        ExternalTraining_AddExternalTrainingDialog_Component,
        ExternalTraining_ArchiveExternalTrainingDialog_Component
    ],
    providers: [
        ExternalTrainingService,
        ExternalTraining_AddExternalTrainingDialog_Factory,
        ExternalTraining_ArchiveExternalTrainingDialog_Factory,
        ExternalTraining_AddUserCreditDialog_Factory,
        GenericFilterPipe,
        CertificationPDFExportService
    ]
})
export class ExternalTrainingListModule {}
