// https://angular.io/guide/sharing-ngmodules
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppHeaderComponent } from './Components/AppHeader/app-header.component';
import { AppDatePickerComponent } from './Components/DatePicker/datepicker.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { HideHeaderDirective } from './Components/AutoHideHeader/auto-hide-header.directive';
import { RankAndUserSelectComponent,UserSelectComponent } from './Components/UserSelect/userselect.component';
import { UserSelectTableComponent } from './Components/UserSelect/UserSelectTableComponent/user-select-table.component';

import {SkeletonTableComponent} from './Components/SkeletonTable/skeleton-table.component';
import { NgSelectModule } from '@ng-select/ng-select';

import { FormFieldValidate_ErrorMessagesService } from './FormFieldValidators/error-messages.service';

import { AppFooterComponent } from './Components/AppFooter/app-footer.component';
import { ExpandableListComponent } from './Components/ExpandableList/expandable-list';

import { SharedFileUploadModule } from './Components/FileUpload/shared-file-upload.module';

import {SharedAngularMaterialModule} from './Shared-Angular-Material.Module';
import { AlertDialogComponent } from './Utilities/AlertDialog/alert-dialog';
import { LoadingDialogComponent } from './LoadingDialog/Loading.Dialog';

import { GenericFilterPipe } from '../shared/generic-filter-pipe';
@NgModule({
    imports: [
        CommonModule,
        IonicModule,
      
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedFileUploadModule,
        SharedAngularMaterialModule,
        ReactiveFormsModule,
        NgSelectModule
        
    ],
    declarations: [
        // Custom Shared/Components
        AppHeaderComponent,
        AppFooterComponent,
        HideHeaderDirective,
        AppDatePickerComponent,
        RankAndUserSelectComponent,
        UserSelectComponent,
        UserSelectTableComponent,
        SkeletonTableComponent,
        ExpandableListComponent,
        AlertDialogComponent,
        LoadingDialogComponent,
        GenericFilterPipe
    ],
    exports: [
        CommonModule,
        IonicModule,
        
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedAngularMaterialModule,
        // Custom Shared/Components
        AppHeaderComponent,
        AppFooterComponent,
        HideHeaderDirective,
        AppDatePickerComponent,
        RankAndUserSelectComponent,
        UserSelectComponent,
        UserSelectTableComponent,
        SkeletonTableComponent,
        ExpandableListComponent,
        SharedFileUploadModule,
        LoadingDialogComponent,
        NgSelectModule
    ],
    providers: [
        
        FormFieldValidate_ErrorMessagesService,
        GenericFilterPipe
            
    ]
})
export class SharedModule {
}
