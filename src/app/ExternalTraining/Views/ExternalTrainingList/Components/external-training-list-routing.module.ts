import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExternalTrainingList_Component } from 'src/app/ExternalTraining/Views/ExternalTrainingList/Components/external-training-list.component';
import { AddExternalTraining_Component } from 'src/app/ExternalTraining/Views/AddExternalTrainingCourse/add-external-training.component'

const routes: Routes = [
    {
        path: '',
        component: ExternalTrainingList_Component,
        children: []
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExternalTrainingListRoutingModule { }
