import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddExternalTraining_Component } from 'src/app/ExternalTraining/Views/AddExternalTrainingCourse/add-external-training.component'

const routes: Routes = [
    {
        path: '',
        component: AddExternalTraining_Component,
        children: []
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AddExternalTrainingRoutingModule { }
