import { NgModule } from '@angular/core';

import { JobTrainingPage } from './page';

import { SharedModule } from '../shared/Shared.Module';

import { JobTrainingRoutingModule } from './jobtraining-routing.module';
import { JobTrainingSharedModule } from './jobtraining-shared.module';
import { JobTrainingProvider } from './Providers/Service';
import { ProgramListPage } from './Views/ProgramList/program-list';

// define module
@NgModule({
  imports: [
    SharedModule,
    JobTrainingSharedModule,
    JobTrainingRoutingModule
  ],
  declarations: [
    // Pages
    JobTrainingPage,
    ProgramListPage
  ],
  entryComponents: [
  ],
  providers: [            
    JobTrainingProvider
  ]
})

// export entire module
export class JobTrainingPageModule { }
