import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';

import { ActiveCoursesPage } from './active-courses.page';

import { SharedModule } from '../shared/Shared.Module';
import { ActiveCoursesProvider } from './Providers/active-courses';

import { ActiveCoursesPopoverDescriptionComponent } from './PopoverDescription/active-courses.popover-description.component';
import { CoursePreviewDialogPage } from './PreviewDialog/preview-dialog';

// define routes
const routes: Routes = [
    {
        path: '',
        component: ActiveCoursesPage
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
        ActiveCoursesPage,

        // Components
        CoursePreviewDialogPage,
        ActiveCoursesPopoverDescriptionComponent
    ],
    entryComponents: [
        CoursePreviewDialogPage,
        ActiveCoursesPopoverDescriptionComponent
    ],
    providers: [
        ActiveCoursesProvider
    ]
})

// export entire module
export class ActiveCoursesPageModule { }
