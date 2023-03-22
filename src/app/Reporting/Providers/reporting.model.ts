import { SafeHtml } from '@angular/platform-browser';
import { KeywordDictionaryInfo } from 'src/app/shared/Utilities/keyword-dictionary.model';
import { MatTableDataSource } from '@angular/material/table';


export class ReportingServerInfo {
    ExternalCreditTypes: any[];
    ExternalCreditCourseTypes: any[];
    CanAddAlternativeTemplate: boolean;
    IsVacadManager: boolean;
    IsDistrictManager: boolean;
    IsHelpDesk: boolean;
    IsDevelopmentSite: boolean;
    IsMultiManagerSite: boolean;
    LastStateReportSubmitDate: string;
    CanShowStateReportButton: boolean;
    PolicyKeywords: any;
    UserKeywords: any;
    PSIDKeywords: any;
    RankKeywords: any;
    HasTrainingYears: boolean;
    CustomTrainingYears: any[];
}

export class ReportTypeInfo{
    Name: string;
    Description: string;
    RouteTo: string;
    DataView: string;
    DisplayCourseType: string;
    MaxUserSelections: number
    MaxCourseSelections: number;
    RestrictCategories: boolean = false;
    DisplayCategories: string[] = [];
    Instructions: string;
    IsDefault: boolean;
    GUIData: ReportTypeGUIData;
    TableConfig: any;
}

export class ReportTypeGUIData{
    IsSelected: boolean = false;
}

export class MandateCreditTypes{
    ID: number;
    Name: string;
}

/**
 * [ReportGenerationPayload] defines the payload object that will be given to the 
 * API call for course report generation.
 */
export class ReportGenerationPayload{
    CourseIDs: number[];
    ExternalTrainingCourseIDs: number[];
    GeneralOrderSectionIDs: number[];
    LearnerIDs: number[];
    CourseYear: string;
    CourseStartRange: string;
    CourseEndRange: string;
    Status: string;
}

export class AcadisReportPayload{
    CourseCompletionStartRange: Date;
    CourseCompletionEndRange: Date;
    StateTemplate: string;
    IncludeNonStateApprovedCourses: boolean;
    FilteredReportData: string;
}

export class ExternalCredit{
    ExternalCreditID: number;
    UserID: number;
    CourseID: number;
    HoursCompleted: number;
    StartDate: Date;
    EndDate: Date;
    IsDeleted: boolean;

}

export class ExternalCreditCourse{
    ExternalCreditCourseID: number;
    Name: string;
    CreditTypeID: number;
    CourseTypeID: number;
    AdditionalDetails: string;
    AdditionalDetailsUploadPath: string;
    AlternativeTemplatePath: string
    IsStateApproved: boolean;
    CreatedOnDate: Date;
    IsDeleted: boolean;

    TypeInfo: ExternalCreditType;
    CourseCreditInfo: ExternalCredit[];
}

export class ExternalCreditType{
    ExternalCreditTypeID: number;
    Name: string;
    HoursRequired: number;
    StateApproved: boolean;
    AllowAdditionalDetails: boolean;
    CanAccrueHours: boolean;
    IsDefault: boolean;
    IsDeleted: boolean = false;

}

export class ExternalCreditCourseType{
    ExternalCreditCourseTypeID: number;
    Name: string;
    IsDeleted: boolean = false;

}

export class MatTableDefinitionForExport {
    FriendlyName: string;
    TechnicalName: string;
    HideForPrint: boolean;
    Datatype: string;
}

export class MatTableConfig{
    TableHeader: string;
    TableColumns: MatTableDefinitionForExport[];
    TableData: MatTableDataSource<any>
}

/**
 * [CourseCompletionStatus] defines the enumerator for course completion statuses
 * that are available to be queried.
 */
export enum CourseCompletionStatus{
    All = "a",
    Complete = "c",
    Incomplete = "i"
}

/**
 * [CourseYear] defines the enumerator for certain cases where a date range may not be neccessary
 * or if the date range is not clear.
 */
export enum CourseYear{
    NoDate = "0"
}
