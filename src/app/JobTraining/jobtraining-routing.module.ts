//leaves-routing.module.ts
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobTrainingPage } from './page';
import { ProgramListPage } from './Views/ProgramList/program-list';

// define routes
const routes: Routes = [
  {
    path: '',
    component: JobTrainingPage,
    children: [
      {
        path: '',
        component: ProgramListPage
      },
      {
        path: 'programdetail/:programid',
        loadChildren: () => import('./Views/ProgramDetails/program-details.module')
          .then(m => m.ProgramDetailsModule)
      },
      {
        path: 'programdetail/:programid/traineeforms/:traineeid',
        loadChildren: () => import('./Views/TraineeForms/trainee-forms.module')
          .then(m => m.TraineeFormsModule)
      },
      {
        path: 'programdetail/:programid/forms/:formid',
        loadChildren: () => import('./Views/FormDesigner/form-designer.module')
          .then(m => m.FormDesignerModule)
      },
      {
        path: 'programdetail/:programid/reports',
        loadChildren: () => import('./Views/Reports/reports.module')
          .then(m => m.ReportsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobTrainingRoutingModule { }
