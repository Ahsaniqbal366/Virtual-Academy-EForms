import { AdminModule } from './Views/Admin/admin.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EFormsPageRoutingModule } from './eforms-routing.module';
import { EFormsPage } from './eforms.page';
import { EFormsSharedModule } from './eforms-shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EFormsPageRoutingModule,
    EFormsSharedModule
  ],
  declarations: [EFormsPage]
})
export class EFormsPageModule {}
