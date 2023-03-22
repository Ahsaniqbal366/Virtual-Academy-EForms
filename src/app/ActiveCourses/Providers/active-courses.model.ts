export class ActiveCourseInfo {
    SNPSectionID: number;
    ClassroomHREF: string;
    WasSelfEnrolled: boolean;
    SNPCourseID: number;
    CallNo: string;
    CourseName: string;
    CourseCategoryIDs: number[];
    CourseCatalogImagePath: string;
    CourseDescription: string;
    HasCourseDescription: boolean;
    HasSMEDetails: boolean;
    SME: ActiveCourseSMEInfo;
    HasWarning: boolean;
    WarningMessage: string;
    HasDuration: boolean;
    FormattedDurationText: string;
    PromoVideoPath: string;
    HasPromoVideo: boolean;
    OwnerID: number;

    GUIData: ActiveCourseGUIData;
}

export class ActiveCourseGUIData {
}

export class ActiveCourseSMEInfo {
    Name: string;
    Title: string;
    Company: string;
}

export class CourseCategoryInfo {
    CategoryID: number;
    CategoryName: string;
    HasCourses: boolean;

    GUIData: CategoryGUIData;
}

export class CategoryGUIData {
    isSelected: boolean;
}

