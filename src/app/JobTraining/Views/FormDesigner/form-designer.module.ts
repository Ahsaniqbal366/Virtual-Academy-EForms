import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';
import { JobTrainingSharedModule } from '../../jobtraining-shared.module';
import { FormDesignerRoutingModule } from './form-designer-routing.module';
import { FormDesignerComponent } from './form-designer.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EditFormSettingsComponent } from './FormSettings/form-settings.component';
import { FormDesignerService } from './form-designer.service';
import { EditFormLikertComponent } from './FormLikert/form-likert.component';
import { EditFormCategoriesComponent } from './FormCategories/form-categories.component';
import { EditFormCategoryFieldsComponent } from './FormField/form-fields-list.component';
import { EditFormFieldComponent } from './FormField/form-field.component';
import { NoneSelectedComponent } from './NoneSelected/none-selected.component';

@NgModule({
    imports: [
        SharedModule,
        CKEditorModule,
        JobTrainingSharedModule,
        FormDesignerRoutingModule
    ],
    declarations: [
        FormDesignerComponent,
        EditFormSettingsComponent,
        EditFormLikertComponent,
        EditFormCategoriesComponent,
        EditFormCategoryFieldsComponent,
        EditFormFieldComponent,
        NoneSelectedComponent
    ],
    entryComponents: [
    ],
    providers: [
        FormDesignerService
    ]
})
export class FormDesignerModule { }
