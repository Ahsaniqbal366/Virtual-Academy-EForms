import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CourseCardContentsComponent, CourseCardContentsDescriptionComponent, CourseCardContentsImageComponent, CourseCardContentsSMEComponent, CourseCardContentsPreviewButtonComponent, FilterCoursesPipe, CourseSelectPopoverDescriptionComponent }
    from './CourseCardContents/courseselect.course-card-contents'
import {CoursePromoVideoDialog} from './CourseCardContents/Dialogs/CoursePromoVideo/course-promo-video-dialog';
import {CourseSelectComponent,GeneralOrderSelectComponent} from './CourseSelectComponent/course-select.component';
import { CourseCategorySelectComponent } from './CourseCategoryComponent/courseselect.course-category-select';
import { CourseSelectTableComponent } from './CourseSelectTableComponent/course-select-table.component';
import {SharedAngularMaterialModule} from 'src/app/shared/Shared-Angular-Material.Module';
import {SharedModule} from 'src/app/shared/Shared.Module';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        SharedModule,
        SharedAngularMaterialModule,
        NgSelectModule
    ],
    declarations: [
        CourseCardContentsComponent,
        CourseCardContentsDescriptionComponent,
        CourseSelectPopoverDescriptionComponent,
        CourseCardContentsImageComponent,
        CourseCardContentsSMEComponent,
        CourseCardContentsPreviewButtonComponent,
        CourseCategorySelectComponent,
        CourseSelectTableComponent,
        CourseSelectComponent,
        CoursePromoVideoDialog,
        GeneralOrderSelectComponent,
        FilterCoursesPipe
    ],
    exports: [
        CourseCardContentsComponent,
        CourseCardContentsDescriptionComponent,
        CourseCardContentsImageComponent,
        CourseCardContentsSMEComponent,
        CourseCardContentsPreviewButtonComponent,
        CourseCategorySelectComponent,
        CoursePromoVideoDialog,
        CourseSelectComponent,
        CourseSelectTableComponent,
        GeneralOrderSelectComponent,
        FilterCoursesPipe
    ],
    entryComponents: [
        CourseSelectPopoverDescriptionComponent
    ]
})
export class CourseSelectModule {
}