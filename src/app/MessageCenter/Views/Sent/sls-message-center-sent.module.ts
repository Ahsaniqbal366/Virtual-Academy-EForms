import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';

import { Routes, RouterModule } from '@angular/router';
import { MessageCenterSentComponent } from './sls-message-center-sent';
import { MessageViewComponent } from '../MessageView/sls-message-view';
import { MessageTableComponent } from '../../Components/MessageTable/sls-message-table';

const routes: Routes = [
    {
        path: '',
        component: MessageCenterSentComponent,
        children: [
            {
                path: '',
                component: MessageTableComponent
            },
            {
                path: 'messageview/:messageID',
                component: MessageViewComponent
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
export class MessageCenterSentModule { }
