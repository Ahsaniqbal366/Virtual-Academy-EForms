import { NgModule } from '@angular/core';

import { SharedModule } from 'src/app/shared/Shared.Module';

// Components
import {PoliciesList_Component} from 'src/app/Policies/Views/PoliciesList/Components/policies-list.component';
import {PoliciesListRoutingModule} from 'src/app/Policies/Views/PoliciesList/Components/policies-list-routing.module';
import {PoliciesListAdmin_Component} from 'src/app/Policies/Components/policies-list-admin.component';
import {PoliciesListUser_Component} from 'src/app/Policies/Components/policies-list-user.component';
import {PoliciesDetails_Component} from 'src/app/Policies/Components/policies-details.component';
import {PoliciesHistory_Component} from 'src/app/Policies/Components/policies-history.component'
import {PoliciesAuditLog_Component} from 'src/app/Policies/Components/AuditLog/policies-audit-log.component'

// Dialogs
import { PolicyManagement_AddPolicyDialog_Component, PolicyManagement_AddPolicyDialog_Factory } from 'src/app/Policies/Components/Dialogs/add-new-policy.dialog'; 
import { UserSelectTableComponent_Dialog, PolicyManagement_UserSelectTableDialog_Factory } from 'src/app/Policies/Components/Dialogs/user-select-table-dialog'; 
import { PolicyManagement_SendReminderDialog_Component, PolicyManagement_SendReminderDialog_Factory } from 'src/app/Policies/Components/Dialogs/policy-signature-reminder.dialog'; 
import { Policies_AuditLogDialog_Component, Policies_AuditLogDialog_Factory} from 'src/app/Policies/Components/AuditLog/Dialog/policies-audit-log.dialog';
import { PolicyManagement_AddPolicyAssesmentDialog_Component, PolicyManagement_AddPolicyAssesmentDialog_Factory} from 'src/app/Policies/Components/Dialogs/add-new-assesment.dialog';
import { PolicyManagement_UserAssesmentDialog_Component, PolicyManagement_UserAssesmentDialog_Factory} from 'src/app/Policies/Components/Dialogs/user-assesment-policy.dialog';
// import { PolicyManagement_UserAssesmentDialog_Factory } from 'src/app/Policies/Components/Dialogs/user-assesment-policy.dialog';
import { SelectUserAssignment } from 'src/app/Policies/Components/Dialogs/select-users-assignment';
import { PoliciesSignatureTable_Component } from 'src/app/Policies/Components/policies-signature-table.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

//Popovers
import { PoliciesManagementTablePopoverMenuComponent } from 'src/app/Policies/Components/Popovers/policies-management-table.popover-menu.component';
// Services
import { PoliciesManagementService } from 'src/app/Policies/Providers/policies.service';
import { PoliciesPDFExportService } from 'src/app/Policies/Providers/policies-pdf-export.service';
import { PoliciesManagement_ArchivePoliciesDialog_Component, Policies_ArchivePoliciesDialog_Factory } from 'src/app/Policies/Components/Dialogs/archive-policies.dialog';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
// import { ImageViewerModule } from 'ng2-image-viewer';

@NgModule({
    imports: [
        SharedModule,
        PoliciesListRoutingModule,
        CKEditorModule,
        NgxDocViewerModule,
        NgxExtendedPdfViewerModule,
        // ImageViewerModule,
        NgxMatSelectSearchModule
    ],
    declarations: [
        PoliciesListAdmin_Component,
        PoliciesListUser_Component,
        PoliciesList_Component,
        PoliciesDetails_Component,
        PoliciesHistory_Component,
        PoliciesAuditLog_Component,
        PoliciesSignatureTable_Component, 
        PolicyManagement_UserAssesmentDialog_Component,
        PolicyManagement_SendReminderDialog_Component,
        SelectUserAssignment,
        PolicyManagement_AddPolicyAssesmentDialog_Component,
        UserSelectTableComponent_Dialog,
        // Dialogs
        PolicyManagement_AddPolicyDialog_Component,
        PoliciesManagement_ArchivePoliciesDialog_Component,
        Policies_AuditLogDialog_Component,
        // Popovers
        PoliciesManagementTablePopoverMenuComponent,
    ],
    entryComponents: [
    ],
    providers: [
        PoliciesManagementService,
        PolicyManagement_AddPolicyDialog_Factory,
        Policies_ArchivePoliciesDialog_Factory,
        PolicyManagement_UserAssesmentDialog_Factory,
        PolicyManagement_SendReminderDialog_Factory,
        PolicyManagement_UserSelectTableDialog_Factory,
        Policies_AuditLogDialog_Factory,
        PolicyManagement_AddPolicyAssesmentDialog_Factory,
        PoliciesPDFExportService,
    ]
})
export class PoliciesListModule {}
