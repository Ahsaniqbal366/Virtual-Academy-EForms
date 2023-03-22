import { DecimalPipe } from '@angular/common';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';

export class ExternalTrainingPermissions {
    isManager: boolean;
    canViewUsersColumn: boolean;
    canEditCertificatesForOtherUsers: boolean;

    constructor(certificationServerInfo: ExternalTrainingServerInfo) {
        this.isManager = certificationServerInfo.isVacadManager || certificationServerInfo.isDistrictManager || certificationServerInfo.isHelpdesk;
        this.canViewUsersColumn = this.isManager;
        this.canEditCertificatesForOtherUsers = this.isManager && !certificationServerInfo.isReadOnly;
    }
}

export class ExternalTrainingServerInfo {
    isVacadManager: boolean;
    isDistrictManager: boolean;
    isHelpdesk: boolean;
    isReadOnly: boolean;

    permissions: ExternalTrainingPermissions;
    users: UserInfo[];

    constructor(serverInfo?) {
        if (serverInfo) {
            this.isVacadManager = serverInfo.isVacadManager;
            this.isDistrictManager = serverInfo.isDistrictManager;
            this.isHelpdesk = serverInfo.isHelpdesk;
            this.isReadOnly = serverInfo.isReadOnly;

            this.users = serverInfo.users;

            this.permissions = new ExternalTrainingPermissions(serverInfo);
        }
    }
}


export class ExternalTrainingCourseTypeInfo {
    ExternalTrainingTypeID: number;
    Name: string;
    SortOrder: number;
    IsDeleted: boolean;

    constructor() { }
}

export class CreditTypeInfo {
    ExternalCreditTypeID: number;
    Name: string;
    AllowAdditionalDetails: boolean;
    CanAccrueHours: boolean;
    HoursRequired: number;

    IsDefault: boolean;
    IsDeleted: boolean;

    SortOrder: number;
    StateApproved: boolean;

    constructor() { }
}

export class ExternalCreditCourseInfo {
    ExternalCreditCourseID: number;
    Name: string;
    AdditionalDetails: string;
    AdditionalDetailsUploadPath: string;
    AlternativeTemplatePath: string;
    CourseTypeID: number;
    CourseTypeInfo: any;
    CreatedOnDate: Date;
    StartDate: Date;
    EndDate: Date;
    Hours: number;
    SME: string;

    CreditTypeID: number;
    CreditTypeInfo: CreditTypeInfo;

    IsDeleted: boolean;
    IsStateApproved: boolean;

    CourseCreditInfo: ExternalCreditInfo[];


    constructor() {

    }
}

export class ExternalCreditInfo{
    ExternalCreditID: number;
    UserID: number;
    CourseID: number;
    HoursCompleted: number;
    StartDate: Date;
    EndDate: Date;
    IsDeleted: boolean;

    UserInfo: UserInfo;

    constructor() {

    }
}

export class MatTableDefinitionForExport {
    FriendlyName: string;
    TechnicalName: string;
    HideForPrint: boolean;
    Datatype: string;
}