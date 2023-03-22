import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { AnnouncementsPage } from './announcements.page';

import { SharedModule } from '../shared/Shared.Module';
import { AnnouncementsProvider } from './Providers/announcements.service';
import { EditAnnouncementDialogPage } from './EditAnnouncementDialog/edit-announcement-dialog';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// tslint:disable-next-line: max-line-length
import { AnnouncementCommentActionsPopoverMenuComponent } from './Components/AnnouncementComments/CommentActionsPopover/announcement-comment-actions.popover-menu.component';
import { AnnouncementCommentTextareaComponent } from './Components/AnnouncementComments/announcement-comment-textarea.component';


// define routes
const routes: Routes = [
    {
        path: '',
        component: AnnouncementsPage
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
        // Pages
        AnnouncementsPage,

        // Components
        AnnouncementCommentTextareaComponent,

        // Dialogs
        EditAnnouncementDialogPage,

        // Popovers
        AnnouncementCommentActionsPopoverMenuComponent
    ],
    entryComponents: [
        // Dialogs
        EditAnnouncementDialogPage,
        // Popovers
        AnnouncementCommentActionsPopoverMenuComponent
    ],
    providers: [
        AnnouncementsProvider
    ]
})

// export entire module
export class AnnouncementsPageModule { }
