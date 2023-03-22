import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';

import { Routes, RouterModule } from '@angular/router';
import { MessageCenterComposeComponent } from './sls-message-center-compose';
import { MessageViewComponent } from '../MessageView/sls-message-view';
import { MessageTableComponent } from '../../Components/MessageTable/sls-message-table';

const routes: Routes = [
    {
        path: '',
        component: MessageCenterComposeComponent,
        children: [
            {
                path: '',
                component: MessageTableComponent
            }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedModule
    ],
    exports: [RouterModule]
})
export class MessageCenterComposeModule { }
