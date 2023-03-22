

export class CourseSelectServerInfo {
    UserPermissions: CourseSelectPermissionsServerInfo;
    UserProfilePicturePath: string;
}

export class CourseSelectPermissionsServerInfo {

}

export class CourseSelectConfig{
    CourseDescriptionConfig: CourseDescriptionConfig;
    IsRollCallCourse: boolean = false;
    IsStandardCourse: boolean = false;
    PreviewText: string = "Preview";
    ShowPreview: boolean = false;
}

export class CourseDescriptionConfig{
    ShowDescriptionButton: boolean;
    ShowFullDescription: boolean;

}

/***************************COURSE INFO***************************/
export class CourseInfo {
    SNPCourseID: number;
    CallNo: string;
    CourseName: string;
    CourseCategoryIDs: number[];
    CourseCatalogImagePath: string;
    CourseDescription: string;
    HasCourseDescription: string;
    HasSMEDetails: string;
    SME: CourseSMEInfo;
    HasWarning: boolean;
    WarningMessage: string;
    HasDuration: boolean;
    FormattedDurationText: string;
    PromoVideoPath: string;
    HasPromoVideo: boolean;
    OwnerID: number;
    CourseStatusTypeInfo: CourseStatusType;
    HasCreditHours: boolean;
    IsAdvertised: boolean;
    FormattedCreditHoursText: string;
    CourseCreatedDate: Date;
    IsExternalTrainingCourse: boolean;

    GUIData: CourseInfoGUIData;

    constructor(){
        this.GUIData = new CourseInfoGUIData();
    }
}

export class CourseSMEInfo{
    Name: string;
    Title: string;
    Company: string;

}

export class CourseStatusType{
    CourseStatusTypeID: number;
    FriendlyName: string;
    AccessName: string;
    CourseCardHeaderColor: string;
    IncludeByDefault: boolean;
    IsArchiveStatus: boolean;
}

export class CourseInfoGUIData {
    IsSelected: boolean;
    IsHiddenBySearch: boolean;
    IsHiddenByCategory: boolean;

    constructor(){
        this.IsSelected = false;
        this.IsHiddenBySearch = false;
        this.IsHiddenByCategory = false;
    }
}

/*********************************GENERAL ORDER INFO**************************/
export class GeneralOrderInfo {
    GeneralOrderName: string;
    SectionID: number;
    

    GUIData: CourseInfoGUIData;

    constructor(){
        this.GUIData = new CourseInfoGUIData();
    }
}

/*********************************COURSE CATEGORY INFO************************/
export class CourseCategoryInfo{
    CategoryID: number;
    CategoryName: string;
    HasCourses: boolean;
    DisplayExternalTraining: boolean;

    GUIData: CourseCategoryGUIData;

    constructor(){
        this.GUIData = new CourseCategoryGUIData;
    }
}

export class CourseCategoryGUIData{
    IsSelected: boolean;
    ShowTab: boolean;

    constructor(){
        this.IsSelected = false;
        this.ShowTab = false;
    }
}
