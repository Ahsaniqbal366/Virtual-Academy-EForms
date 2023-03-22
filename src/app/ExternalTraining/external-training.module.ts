import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { ExternalTrainingPage } from './external-training.page';

import { SharedModule } from '../shared/Shared.Module';
// import { GenericFilterPipe } from '../shared/generic-filter-pipe';

// define routes
const routes: Routes = [
    {
        path: '',
        component: ExternalTrainingPage,
        children: [
            {
                path: '',
                loadChildren: () => import('./Views/ExternalTrainingList/Components/external-training-list.module')
                    .then(m => m.ExternalTrainingListModule)
            },
            {
                path: 'add-new-course',
                loadChildren: () => import('./Views/AddExternalTrainingCourse/add-external-training.module')
                    .then(m => m.AddExternalTrainingModule)
            }
        ]
    }
];

// define module
@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    declarations: [
        // Pages
        ExternalTrainingPage,
        // Components

        // Dialogs

        // Popovers
        // Misc
        // GenericFilterPipe
    ],
    entryComponents: [
        // Dialogs 
        // Popovers
    ],
    providers: [
    ],
    exports: [RouterModule]
})

// export entire module
export class ExternalTrainingModule { }
