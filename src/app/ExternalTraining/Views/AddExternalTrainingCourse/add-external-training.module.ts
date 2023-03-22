import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';

// Components
import {AddExternalTraining_Component} from 'src/app/ExternalTraining/Views/AddExternalTrainingCourse/add-external-training.component';
import {AddExternalTrainingRoutingModule} from 'src/app/ExternalTraining/Views/AddExternalTrainingCourse/add-external-training-routing.module';


// Dialogs

// Services
import { ExternalTrainingService } from 'src/app/ExternalTraining/Providers/external-training.service';
import { GenericFilterPipe } from 'src/app/shared/generic-filter-pipe';
import { CertificationPDFExportService } from 'src/app/ExternalTraining/Providers/external-training-pdf-export.service';


@NgModule({
    imports: [
        SharedModule,
        AddExternalTrainingRoutingModule
    ],
    declarations: [
        AddExternalTraining_Component,

    ],

    providers: [
        ExternalTrainingService,
        GenericFilterPipe,
        CertificationPDFExportService
    ]
})
export class AddExternalTrainingModule {}
