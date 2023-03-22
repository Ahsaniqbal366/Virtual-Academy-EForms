import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProgramTraineesComponent } from './ProgramTrainees/program-trainees.component';
import { ProgramDetailComponent } from './program-detail';
//import { ProgramDetails404Component } from './temp404-component';
import { ProgramUsersComponent } from './ProgramUsers/program-users.component';
import { ProgramFormsComponent } from './ProgramForms/program-forms.component';
import { ProgramAdminToDoComponent } from '../ProgramAdminToDo/program-admin-to-do.component';
import { FormDetailsComponent } from '../TraineeForms/Components/form-details';
import { FormDetailsCanDeactivateGuard } from '../TraineeForms/Components/form-details.can-deactivate.guard';
import { ReportsListComponent } from './ReportsList/reports-list.component';

const routes: Routes = [
    {
        path: '',
        component: ProgramDetailComponent,
        children: [
            {
                path: '',
                redirectTo: 'trainees',
                pathMatch: 'full'
            },
            {
                path: 'trainees',
                component: ProgramTraineesComponent
            },
            {
                path: 'users',
                component: ProgramUsersComponent
            },
            {
                path: 'todo',
                component: ProgramAdminToDoComponent,
                children: [
                    {
                        path: 'formdetails/:recordid',
                        component: FormDetailsComponent,
                        canDeactivate: [FormDetailsCanDeactivateGuard]
                    }
                ]
            },
            {
                path: 'reports',
                component: ReportsListComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProgramDetailsRoutingModule { }
