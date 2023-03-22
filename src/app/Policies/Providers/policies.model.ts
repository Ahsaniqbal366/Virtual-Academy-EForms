import { DecimalPipe } from '@angular/common';
import { UserInfo } from 'src/app/shared/Components/UserSelect/Providers/userselect.model';
import { IAddPolicyAssesment } from '../Components/Dialogs/add-new-assesment.dialog';

// export class PoliciesPermissions {
//     isManager: boolean;
//     canViewUsersColumn: boolean;
//     canEditPoliciesForOtherUsers: boolean;

//     constructor(policiesServerInfo: PoliciesServerInfo) {
//         this.isManager = policiesServerInfo.isVacadManager || policiesServerInfo.isDistrictManager || policiesServerInfo.isHelpdesk;
//         this.canViewUsersColumn = this.isManager;
//         this.canEditPoliciesForOtherUsers = this.isManager && !policiesServerInfo.isReadOnly;
//     }
// }

export class PoliciesServerInfo {
    isAdmin: boolean;
    userID: number;
    portalID: number;
    groupID: number;
    state: string;
    // isVacadManager: boolean;
    // isDistrictManager: boolean;
    // isHelpdesk: boolean;
    // isReadOnly: boolean;

    // permissions: PoliciesPermissions;
    // users: UserInfo[];
    // ExpiryThresholds: any;

    constructor(serverInfo?) {
        if (serverInfo) {
            this.isAdmin = serverInfo.isAdmin;
        }
    }
}

export class PoliciesAsessmentAnswersInfo {
    policyAssessmentAnswerId: number;
    policyAssessmentQuestionId: number;
    answerBody: string;
    isCorrect: true;
    isActive: true;
    isUserSelected?: boolean;
    constructor() { }
}
export class PoliciesAsessmentQuestionsInfo {
    policyAssessmentQuestionId: number;
    policyAssessmentId: number;
    questionBody: string;
    pointsAvailable: 0;
    isActive: true;
    policyAssessmentAnswers: PoliciesAsessmentAnswersInfo[];

    constructor() { }
}

export class PoliciesAsessmentInfo {
    policyAssessmentId: number;
    policyIssueId: number;
    isActive:  boolean;
    policyAssessmentQuestions: PoliciesAsessmentQuestionsInfo[];

    constructor() { }
}

export interface PoliciesUserInfo {
    id: number;
    name: string;
}

export class PoliciesInfo {
    policyId: Number;
    policyIssueId?: number;
    policyNumber: string;
    assignmentUserIds?: Array<any>;
    friendlyName: string;
    body: string;
    description?: string;
    effectiveDate: Date;
    reviewDate: Date;
    expireDate: Date;
    isDeleted: boolean;
    isExpired?: boolean;
    isSelectAll: boolean;
    policyStatusId: number;
    policyFilePath: string;
    policyAssessments: Array<any> = [];
    policyAssignments: Array<any> = [];

    isRemoveAttachment?: boolean;
    History?: PoliciesInfo[];
    constructor() {
    }
}

export class PoliciesUpdateInfo {
    policyId: Number;
    policyNumber: string;
    assignmentUserIds: Array<any>;
    friendlyName: string;
    body: string;
    effectiveDate: Date;
    reviewDate: Date;
    policyIssueId: number;
    policyIssueStatusId: number;
    policyFilePath: string;
    policyAssessments: Array<any>;

    History: PoliciesInfo[];

    constructor() {

    }
}

export class PoliciesDetailInfo {
    policyId: number;
    policyIssueId: number;
    policyStatusId: number;
    policyNumber: string;
    friendlyName: string;
    body: string;
    startDate: string;
    expireDate: string;
    effectiveDate: string;
    reviewDate: string;
    isDeleted: boolean;
    policyFilePath: string;
    hasAcknowledged: boolean;
    policyAssessments: Array<any>;
    policyAssignments: Array<any>;
    isSelectAll: boolean;

    constructor() {

    }
}

export class ResetPolicy {
    userId: Number;
    policyIssueId: Number;
    assessmentId: Number;

    constructor() {

    }
}

export class PoliciesAssignments {
    id: Number;
    userId: Number;
    psid: Number;
    assigneeName: string;
    isAcknowledged: Boolean;
    isAssessmentCompleted: Boolean;

    constructor() {

    }
}

export class UserAssessmentAnswer {
    questionId: Number;
    answerId: Number;

    constructor() {

    }
}

export class UserAssessment {
    userId: Number;
    assessmentId: Number;
    policyIssueId: string;
    isAcknowledged: Boolean;
    lstPolicyQuestionAnswers: UserAssessment;

    constructor() {

    }
}

export class PoliciesAuditLogInfo{
    ActionTaken: string;
    PoliciesID: number;
    EntryDate: Date;
    Modification: string;
    ParentPoliciesID: number;
    User: string;

    PreviousModification: PoliciesAuditLogInfo;
    DeserializedModification: PoliciesInfo;

}

export class MatTableDefinitionForExport {
    FriendlyName: string;
    TechnicalName: string;
    HideForPrint: boolean;
    Datatype: string;
    Width?: number;
}