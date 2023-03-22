import { SharedModule } from './../../../shared/Shared.Module';
import { AdminEformRequestsComponent } from './Components/admin-eform-requests/admin-eform-requests.component';
import { AdminAvailableFormsComponent } from './Components/admin-available-forms/admin-available-forms.component';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { EFormsSharedModule } from "../../eforms-shared.module";
import { AdminRoutingModule } from "./admin-routing.module";
import { AdminDashboardComponent } from "./Components/admin-dashboard/admin-dashboard.component";
import { AdminHomeComponent } from "./Components/admin-home/admin-home.component";
import { AdminViewFormComponent } from './Components/admin-view-form/admin-view-form.component';



@NgModule({
  declarations: [
    AdminHomeComponent,
    AdminDashboardComponent,
    AdminAvailableFormsComponent,
    AdminEformRequestsComponent,
    AdminViewFormComponent
  ],
  imports: [
    CommonModule,
    EFormsSharedModule,
    AdminRoutingModule,
    MatMenuModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDividerModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatTableModule
  ]
})
export class AdminModule { }
