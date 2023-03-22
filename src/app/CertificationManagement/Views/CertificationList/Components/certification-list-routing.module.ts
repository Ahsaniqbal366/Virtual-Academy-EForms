import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CertificationList_Component } from 'src/app/CertificationManagement/Views/CertificationList/Components/certification-list.component';
import { CertificationAuditLog_Component } from 'src/app/CertificationManagement/Components/AuditLog/certification-audit-log.component'

const routes: Routes = [
    {
        path: '',
        component: CertificationList_Component,
        children: []
    },
    {
        path: 'audit-log',
        component: CertificationAuditLog_Component
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CertificationListRoutingModule { }
