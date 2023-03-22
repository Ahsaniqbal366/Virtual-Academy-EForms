import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/Shared.Module';

import { ProfilesPage } from './profiles.page';
import { ProfilesProvider } from './Providers/profiles.service';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MyProfilePage } from './Views/MyProfile/my-profile';
import { MainRosterPage } from './Views/MainRoster/main-roster';
import { ProfileCardComponent } from './Components/ProfileCard/ProfileCard';
import { RosterFilterPipe } from './Views/MainRoster/roster-filter-pipe';

import { AdditionalInfoDialogComponent } from './Components/Dialogs/AdditionalInfoDialog/AdditionalInfoDialog.component';
import { MessageUserDialogComponent } from './Components/Dialogs/MessageUserDialog/MessageUserDialog.component';

// define routes
const routes: Routes = [
    {
        path: '',
        component: ProfilesPage
    },
    {
        path: 'myProfile',
        component: MyProfilePage
    },
    {
        path: 'Roster',
        component: MainRosterPage
    }
];

// define module
@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedModule,
        CKEditorModule
    ],
    declarations: [
        // Pages
        ProfilesPage,
        MyProfilePage,
        MainRosterPage,
        ProfileCardComponent,
        RosterFilterPipe,
        // Components
        // Dialogs		
		AdditionalInfoDialogComponent,
		MessageUserDialogComponent
        // Popovers
    ],
    entryComponents: [
    ],
    providers: [
        ProfilesProvider
    ],
    exports: [RouterModule]
})

// export entire module
export class ProfilesPageModule { }
