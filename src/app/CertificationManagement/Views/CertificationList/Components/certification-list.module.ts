import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';

// Components
import {CertificationList_Component} from 'src/app/CertificationManagement/Views/CertificationList/Components/certification-list.component';
import {CertificationListRoutingModule} from 'src/app/CertificationManagement/Views/CertificationList/Components/certification-list-routing.module';
import {CertificationDetails_Component} from 'src/app/CertificationManagement/Components/certification-details.component';
import {CertificationHistory_Component} from 'src/app/CertificationManagement/Components/certification-history.component'
import {CertificationAuditLog_Component} from 'src/app/CertificationManagement/Components/AuditLog/certification-audit-log.component'

// Dialogs
import { CertificationManagement_AddCertificationDialog_Component, CertificationManagement_AddCertificationDialog_Factory } from 'src/app/CertificationManagement/Components/Dialogs/add-new-certification.dialog'; 
import { CertificationManagement_AuditLogDialog_Component, CertificationManagement_AuditLogDialog_Factory} from 'src/app/CertificationManagement/Components/AuditLog/Dialog/certification-audit-log.dialog';

//Popovers
import { CertificationManagementTablePopoverMenuComponent } from 'src/app/CertificationManagement/Components/Popovers/certification-management-table.popover-menu.component';
// Services
import { CertificationManagementService } from 'src/app/CertificationManagement/Providers/certification-management.service';
import { CertificationPDFExportService } from 'src/app/CertificationManagement/Providers/certification-pdf-export.service';
import { CertificationManagement_ArchiveCertificationDialog_Factory, CertificationManagement_ArchiveCertificationDialog_Component } from 'src/app/CertificationManagement/Components/Dialogs/archive-certification.dialog';


@NgModule({
    imports: [
        SharedModule,
        CertificationListRoutingModule
    ],
    declarations: [
        CertificationList_Component,
        CertificationDetails_Component,
        CertificationHistory_Component,
        CertificationAuditLog_Component,
        // Dialogs
        CertificationManagement_AddCertificationDialog_Component,
        CertificationManagement_ArchiveCertificationDialog_Component,
        CertificationManagement_AuditLogDialog_Component,
        // Popovers
        CertificationManagementTablePopoverMenuComponent
    ],
    entryComponents: [
    ],
    providers: [
        CertificationManagementService,
        CertificationManagement_AddCertificationDialog_Factory,
        CertificationManagement_ArchiveCertificationDialog_Factory,
        CertificationManagement_AuditLogDialog_Factory,
        CertificationPDFExportService
    ]
})
export class CertificationListModule {}
