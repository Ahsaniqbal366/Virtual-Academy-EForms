import { TableComponent } from './Components/table/table.component';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './Components/header/header.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/Shared.Module';


@NgModule({
  declarations: [
    HeaderComponent,
    TableComponent
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    RouterModule,
    SharedModule,
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
  ],
  exports : [
    HeaderComponent,
    TableComponent,
    CommonModule,
    FormsModule
  ]
})
export class EFormsSharedModule { }
