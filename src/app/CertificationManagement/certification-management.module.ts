import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { CertificationManagementPage } from './certification-management.page';

import { SharedModule } from '../shared/Shared.Module';

//import { CertificationManagementProvider } from './Providers/reporting.service';
import { MessageCenterProvider } from 'src/app/MessageCenter/Providers/message-center.service';

// define routes
const routes: Routes = [
    {
        path: '',
        component: CertificationManagementPage,
        children: [
            {
                path: '',
                loadChildren: () => import('./Views/CertificationList/Components/certification-list.module')
                    .then(m => m.CertificationListModule)
            },
            {
                path: 'manager-view',
                loadChildren: () => import('./Views/CertificationList/Components/certification-list.module')
                    .then(m => m.CertificationListModule)
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
        CertificationManagementPage,
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
export class CertificationManagementModule { }
