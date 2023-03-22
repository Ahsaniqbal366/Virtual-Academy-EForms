import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { PoliciesPage } from './policies.page';

import { SharedModule } from '../shared/Shared.Module';

//import { CertificationManagementProvider } from './Providers/reporting.service';
import { MessageCenterProvider } from 'src/app/MessageCenter/Providers/message-center.service';

// define routes
const routes: Routes = [
    {
        path: '',
        component: PoliciesPage,
        children: [
            {
                path: '',
                loadChildren: () => import('./Views/PoliciesList/Components/policies-list.module')
                    .then(m => m.PoliciesListModule)
            },
            {
                path: 'manager-view',
                loadChildren: () => import('./Views/PoliciesList/Components/policies-list.module')
                    .then(m => m.PoliciesListModule)
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
        PoliciesPage,
        // Components

        // Dialogs

        // Popovers
    ],
    entryComponents: [
        // Dialogs 
        // Popovers
    ],
    providers: [
        MessageCenterProvider
    ],
    exports: [RouterModule]
})

// export entire module
export class PoliciesModule { }
