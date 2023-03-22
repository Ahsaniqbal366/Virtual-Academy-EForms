import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatCardModule } from '@angular/material/card';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { APIBaseService } from './shared/API.Base.Service';

import { DNNEmbedService } from './shared/DNN.Embed.Service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { Ionic4DatepickerModule } from '@logisticinfotech/ionic4-datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDialogModule} from '@angular/material/dialog';
import { MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule} from '@angular/material/select';
import { TechSupportDialogComponent } from './signin/tech-support-dialog/tech-support-dialog.component';
import { PrivacyDialogComponent } from './shared/Components/AppFooter/privacy-dialog/privacy-dialog.component';
import { TermsOfUseDialogComponent } from './shared/Components/AppFooter/terms-of-use-dialog/terms-of-use-dialog.component';
import { ConfirmComponent } from './shared/Components/Confirm/confirm.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
/*
 JLP Added TechSupportDialogComponent to declarations and EntryComponents so it can work with mdDialog
 JLP also added confirm component
 */

@NgModule({
  declarations: [AppComponent, TechSupportDialogComponent, PrivacyDialogComponent, TermsOfUseDialogComponent, ConfirmComponent],
  entryComponents: [TechSupportDialogComponent,PrivacyDialogComponent, TermsOfUseDialogComponent, ConfirmComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot({ mode: 'md' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule, 
    MatStepperModule, 
    MatListModule,
    /**
     * JTC 2/14/2020
     * ------
     * This is some automatically added Angular PWA line.
     * It defaulted to '/ngsw-worker.js'.
     * We have tried using './ngsw-worker.js' in the past to resolve
     * some index.html base path issues, but that did not work.
     * JLP 8/5/20 removed the leading / on ngsw-worker.js and this works in staging environment
     */
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    Ionic4DatepickerModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CKEditorModule,
    NgxMatSelectSearchModule 
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    APIBaseService,
    DNNEmbedService,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

declare global{
  interface Navigator{
     msSaveBlob:(blob: Blob,fileName:string) => boolean
     }
  }