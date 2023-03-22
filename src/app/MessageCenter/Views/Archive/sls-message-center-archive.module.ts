import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';
import { Routes, RouterModule } from '@angular/router';
import { MessageCenterArchiveComponent } from './sls-message-center-archive';
import { MessageViewComponent } from '../MessageView/sls-message-view';
import { MessageTableComponent } from '../../Components/MessageTable/sls-message-table';

const routes: Routes = [
    {
        path: '',
        component: MessageCenterArchiveComponent,
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
export class MessageCenterArchiveModule { }
