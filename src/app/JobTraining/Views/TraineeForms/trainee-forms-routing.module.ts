import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TraineeFormsComponent } from './trainee-forms.component';
import { FormDetailsComponent } from './Components/form-details';
import { FormDetailsCanDeactivateGuard } from './Components/form-details.can-deactivate.guard';


const routes: Routes = [
    {
        path: '',
        redirectTo: 'filter/dailyforms',
        pathMatch: 'full'
    },
    {
        /**
         * [:formfiltermode] is a type of filter applied by default
         * when the user selects a trainee. It defaults to 'dailyforms' for example.
         * There is a collection of buttons, or similar in the GUI that lets the 
         * user choose other filters like ['calllog', 'tasklist', or 'allforms'].
         * ----
         * This is a useful route to have so the user can refresh the page without
         * losing their FULL position.
         */
        path: 'filter/:formfiltermode',
        component: TraineeFormsComponent,
        children: [
            {
                path: 'formdetails/:recordid',
                component: FormDetailsComponent,
                canDeactivate: [FormDetailsCanDeactivateGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TraineeFormsRoutingModule { }
