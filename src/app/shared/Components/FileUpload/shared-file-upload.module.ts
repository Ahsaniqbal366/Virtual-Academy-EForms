// https://angular.io/guide/sharing-ngmodules
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { APIBaseService } from '../../API.Base.Service';
import { FileUploadComponent } from './file-upload.component';
import { FileUploadDialog, FileUploadDialogFactory } from './file-upload.dialog';
import { FileUploadService } from './file-upload.service';
import { UserMediaService } from './user-media.service';
import { FileUploadedComponent } from './file-uploaded.component';

@NgModule({
    imports: [
        CommonModule,
        IonicModule
    ],
    declarations: [
        FileUploadComponent,
        FileUploadDialog,
        FileUploadedComponent      
    ],
    providers: [
        APIBaseService,
        FileUploadDialogFactory,
        FileUploadService,
        UserMediaService    
    ],
    exports: [
        FileUploadComponent,
        //FileUploadDialog,
        //FileUploadDialogFactory,
        //FileUploadService,
        //UserMediaService,
        FileUploadedComponent
    ]
})
export class SharedFileUploadModule {
}
