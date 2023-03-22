import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/Shared.Module';

import { MessageCenterPage } from './Message-center.page';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MessageCenterProvider } from './Providers/message-center.service';

import { MessageTableComponent } from './Components/MessageTable/sls-message-table';
import { MessageViewComponent } from './Views/MessageView/sls-message-view';
import { MessageCenterInboxComponent } from './Views/Inbox/sls-message-center-inbox';
import { MessageCenterComposeComponent } from './Views/Compose/sls-message-center-compose';
import { MessageCenterTrashComponent } from './Views/Trash/sls-message-center-trash';
import { MessageCenterArchiveComponent } from './Views/Archive/sls-message-center-archive';
import { MessageCenterSentComponent } from './Views/Sent/sls-message-center-sent';
import { MessageTableFilterPipe } from './Components/MessageTable/sls-message-table-filter.pipe';
import { MessageCenterMasterActionComponent } from './Components/MasterActionFooter/sls-message-center-master-action';
import { SignatureEditor } from './Components/SignatureEditor/signature-editor';
import { UserSelectDialogComponent } from '../shared/Components/UserSelect/Dialogs/userselect.dialog';

const routes: Routes = [
    {
        path: '',
        component: MessageCenterPage,
        children: [
            {
                path: '',
                redirectTo: 'inbox',
                pathMatch: 'full'
            },
            {
                path: 'inbox',
                loadChildren: () => import('./Views/Inbox/sls-message-center-inbox.module')
                    .then(m => m.MessageCenterInboxModule)
            },
            {
                path: 'compose',
                loadChildren: () => import('./Views/Compose/sls-message-center-compose.module')
                    .then(m => m.MessageCenterComposeModule)
            },
            {
                path: 'sent',
                loadChildren: () => import('./Views/Sent/sls-message-center-sent.module')
                    .then(m => m.MessageCenterSentModule)
            },
            {
                path: 'trash',
                loadChildren: () => import('./Views/Trash/sls-message-center-trash.module')
                    .then(m => m.MessageCenterTrashModule)
            },
            {
                path: 'archive',
                loadChildren: () => import('./Views/Archive/sls-message-center-archive.module')
                    .then(m => m.MessageCenterArchiveModule)
            }
        ]
    }
];

// define module
@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedModule,
        CKEditorModule
    ],
    declarations: [
        // Router Outlet Pages
        MessageCenterPage,
        MessageCenterInboxComponent,
        MessageCenterComposeComponent,
        SignatureEditor,
        MessageCenterSentComponent,
        MessageCenterTrashComponent,
        MessageCenterArchiveComponent,
        // View Components
        MessageTableComponent,
        MessageViewComponent,
        MessageCenterMasterActionComponent,
        // Pipes
        MessageTableFilterPipe,
        // Shared 
        UserSelectDialogComponent
    ],
    entryComponents: [
    ],
    providers: [
        MessageCenterProvider
    ],
    exports: [
        RouterModule
    ]
})

// export entire module
export class MessageCenterPageModule { }
