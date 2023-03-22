

export class UserSelectServerInfo {
    UserPermissions: UserSelectPermissionsServerInfo;
    UserProfilePicturePath: string;
}

export class UserSelectPermissionsServerInfo {

}

export class UserInfo {
    AcadisID: string;
    RankID: string;
    FullName: string;
    UserID: number;
    GUIData: UserInfoGUIData;
    ProfilePicture: string;
    Rank: string;

    constructor(){
        this.GUIData = new UserInfoGUIData();
    }
}

export class UserInfoGUIData {
    IsSelected: boolean;
    IsHiddenBySearch: boolean;

    constructor(){
        this.IsSelected = false;
        this.IsHiddenBySearch = false;
    }
}

export class RoleInfo{
    RoleID: number;
    RoleName: string;
    GUIData: RoleInfoGUIData;

    constructor(){
        this.GUIData = new RoleInfoGUIData();
    }
}

export class RoleInfoGUIData{
    IsSelected: boolean;
    IsHiddenBySearch: boolean;

    constructor(){
        this.IsSelected = false;
        this.IsHiddenBySearch = false;
    }
}