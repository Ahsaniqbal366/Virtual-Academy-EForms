import { DecimalPipe } from '@angular/common';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';

export class CertificationPermissions {
    isManager: boolean;
    canViewUsersColumn: boolean;
    canEditCertificatesForOtherUsers: boolean;

    constructor(certificationServerInfo: CertificationServerInfo) {
        this.isManager = certificationServerInfo.isVacadManager || certificationServerInfo.isDistrictManager || certificationServerInfo.isHelpdesk;
        this.canViewUsersColumn = this.isManager;
        this.canEditCertificatesForOtherUsers = this.isManager && !certificationServerInfo.isReadOnly;
    }
}

export class CertificationServerInfo {
    isVacadManager: boolean;
    isDistrictManager: boolean;
    isHelpdesk: boolean;
    isReadOnly: boolean;

    permissions: CertificationPermissions;
    users: UserInfo[];
    ExpiryThresholds: any;

    constructor(serverInfo?) {
        if (serverInfo) {
            this.isVacadManager = serverInfo.isVacadManager;
            this.isDistrictManager = serverInfo.isDistrictManager;
            this.isHelpdesk = serverInfo.isHelpdesk;
            this.isReadOnly = serverInfo.isReadOnly;
            
            this.users = serverInfo.users;
            
            this.permissions = new CertificationPermissions(serverInfo);
            this.ExpiryThresholds = serverInfo.ExpiryThresholds;
        }
    }
}


export class CertificationTypeInfo {
    CertificationTypeID: number;
    Name: string;
    SortOrder: number;
    IsDeleted: boolean;

    constructor() { }
}

export class CertificationInfo {
    CertificationID: number;
    Title: string;
    UserID: number;
    UserDisplayName: string;
    TypeID: number;
    TrainingHours: number;
    CompletionDate: Date;
    ExpirationDate: Date;
    Cloudpath: string;
    DateAdded: Date;
    AddedBy: string;
    DateUpdated: Date;
    UpdatedBy: string;
    IsTrainingRecord: boolean;
    IsDeleted: boolean;
    HasUnreviewedChanges: boolean;
    LastReviewDate: Date;

    TypeInfo: CertificationTypeInfo;

    IsExpired: boolean;
    IsValid: boolean;
    IsNearing: boolean;
    IsModerate: boolean;
    ExpiryStatusTooltipText: string;

    History: CertificationInfo[];

    AlertDate?: Date;

    ReasonForArchive: string;

    constructor() {

    }
}

export class CertificationAuditLogInfo{
    ActionTaken: string;
    CertificationID: number;
    EntryDate: Date;
    Modification: string;
    ParentCertificationID: number;
    User: string;

    PreviousModification: CertificationAuditLogInfo;
    DeserializedModification: CertificationInfo;

}

export class MatTableDefinitionForExport {
    FriendlyName: string;
    TechnicalName: string;
    HideForPrint: boolean;
    Datatype: string;
}