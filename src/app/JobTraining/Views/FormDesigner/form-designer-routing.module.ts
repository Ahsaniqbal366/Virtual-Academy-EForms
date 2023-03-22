import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormDesignerComponent } from './form-designer.component';
import { EditFormSettingsComponent } from './FormSettings/form-settings.component';
import { EditFormLikertComponent } from './FormLikert/form-likert.component';
import { EditFormCategoriesComponent } from './FormCategories/form-categories.component';
import { NoneSelectedComponent } from './NoneSelected/none-selected.component';
import { EditFormCategoryFieldsComponent } from './FormField/form-fields-list.component';
import { EditFormFieldComponent } from './FormField/form-field.component';

const routes: Routes = [
    {
        path: '',
        component: FormDesignerComponent,
        children: [
            {
                path: '',
                redirectTo: 'settings',
                pathMatch: 'full'
            },
            {
                path: 'settings',
                component: EditFormSettingsComponent,
            },
            {
                path: 'likert',
                component: EditFormLikertComponent,
            },
            {
                path: 'categories',
                component: EditFormCategoriesComponent,
            },
            {
                path: 'category/:categoryid/fields',
                component: EditFormCategoryFieldsComponent,
            },
            {
                path: 'category/:categoryid/field/:fieldid',
                component: EditFormFieldComponent,
            },
            {
                path: 'none',
                component: NoneSelectedComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FormDesignerRoutingModule { }
