import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PoliciesList_Component } from 'src/app/Policies/Views/PoliciesList/Components/policies-list.component';
import { PoliciesAuditLog_Component } from 'src/app/Policies/Components/AuditLog/policies-audit-log.component'

const routes: Routes = [
    {
        path: '',
        component: PoliciesList_Component,
        children: []
    },
    {
        path: 'audit-log',
        component: PoliciesAuditLog_Component
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PoliciesListRoutingModule { }
