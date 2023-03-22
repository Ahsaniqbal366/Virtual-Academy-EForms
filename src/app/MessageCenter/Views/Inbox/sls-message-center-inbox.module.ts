import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/Shared.Module';
import { RouterModule, Routes } from '@angular/router';
import { MessageCenterInboxComponent } from './sls-message-center-inbox';
import { MessageViewComponent } from '../../Views/MessageView/sls-message-view';
import { MessageViewModule } from '../MessageView/sls-message-view.module';
import { MessageTableComponent } from '../../Components/MessageTable/sls-message-table';

const routes: Routes = [
    {
        path: '',
        component: MessageCenterInboxComponent,
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

export class MessageCenterInboxModule { }
