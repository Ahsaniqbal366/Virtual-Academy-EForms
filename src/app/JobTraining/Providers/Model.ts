/******************************* SERVER INFO *************************/
export interface ServerInfo {
    BasicUserInfo: BasicUserInfo;

    CanEditPrograms: boolean;
}
export interface BasicUserInfo {    
    UserID: number;
    DisplayName: string;
}


/******************************* PROGRAM *************************/
export interface BasicTrainingProgramInfo {
    ProgramID: number;
    PortalID: number;
    Name: string;
    IsArchived: boolean;
    ArchivedOnDate: Date;
}

export interface FullTrainingProgramInfo extends BasicTrainingProgramInfo {
    ShiftInfo: JobTrainingShift[];
    Phases: PhaseInfo[];
    NonTraineeRoles: RoleInfo[];
    IsTraineeUser: boolean;
    IsAdminUser: boolean;
    Permissions: ProgramPermissionInfo;
    CallLogTaskListID: number;
    PerformanceTaskListID: number;
}

export interface ProgramPermissionInfo {
    CanExportForms: boolean;
}

export interface SummaryRuleInfo {
    RuleID: number;
    ProgramID: number;
    FieldTypeID: number;
    FieldTypeName: string;
    RuleTypeID: string;
    RuleTypeName: string;
    RuleLevelID: string;
    RuleLevelName: string;
    FriendlyName: string;
    SortOrder: number;
}


/******************************* USER & ROLE INFO *************************/

export interface ProgramUserInfo {    
    ProgramID: number;
    UserID: number;
    DisplayName: string;
    AcadisID: string;
    ProfilePhotoPath: string;
    RoleIDs: number[];
    Roles: string[];
    IsTraineeUser: boolean;
}

export interface RoleInfo {
    ProgramRoleID: number;
    Name: string;
    Description: string;
    IsAdmin: boolean;
    IsTrainee: boolean;
}

/******************************* TRAINEE *************************/
export interface JobTrainingShift {
    ShiftID: number;
    Name: string;
    IsDeleted: boolean;
    CreatedOnDate: Date;
    CreatedByUserID: number;
    Expanded: boolean;

    Trainees: TraineeUserInfo[];
}

export interface TraineeUserInfo {
    ProgramUserID: number;
    ProgramID: number;
    UserID: number;
    DisplayName: string;
    AcadisID: string;
    ProfilePhotoPath: string;
    // Used for claiming a trainee for the current shift
    IsClaimed: boolean;
    IsClaimedByCurrentUser: boolean;
    Claimant: string;

    ShiftID: number;
    ShiftName: string;

    PhaseID: number;
    PhaseName: string;

    Summary: TraineeGeneralSummaryInfo;
}

// export class FullProgramUserInfoGUIData {
//     HasForms: boolean;
// }

/******************************* TRAINEE SUMMARIES *************************/

export class TraineeGeneralSummaryInfo {
    Status: TraineeGeneralSummaryStatusInfo = new TraineeGeneralSummaryStatusInfo();
    FormattedData: TraineeGeneralSummaryFormattedDataInfo[] = [];
}

export class TraineeGeneralSummaryStatusInfo {
    IsComplete: boolean = false;
    ActionRequired: boolean = false;
    Text: string = '';
    HoverText: string = '';
    Theme: string = '';
    CSSClass: string = '';
    HasError: boolean = false;
}

export interface TraineeGeneralSummaryFormattedDataInfo {
    DataName: string;
    DataValue: string;
}

/******************************* PHASE ****************************/
export interface PhaseInfo {
    ProgramID: number;
    PhaseID: number;
    Name: string;
    SortOrder: number;
}

export interface TraineePhaseInfo extends PhaseInfo {
    FormGroups: TraineeFormRecordGroup[];
    Summary: TraineeGeneralSummaryInfo;
    GUIData: PhaseGUIData;
}

export interface TraineeFormRecordGroup {
    FormID: number;
    GroupedFormsDate: Date;
    GroupName: string;
    GroupIsSingle: boolean;
    GroupedBy: string;
    FormOwners: string[];
    TraineeFormRecords: TraineeFormRecordInfo[];
    Summary: TraineeGeneralSummaryInfo;
    GUIData: FormGroupGUIData;
}

export class PhaseGUIData {
    Expanded: boolean;
    HasForms: boolean;
    IsHidden: boolean;
}

export class FormGroupGUIData {
    Expanded: boolean;
}

/******************************* TASK LIST ****************************/
export interface FullTraineeTaskListInfo {
    TaskListID: number;
    ProgramID: number;
    Name: string;
    Categories: FullTraineeTaskListCategoryInfo[];
}
export interface FullTraineeTaskListCategoryInfo {
    TaskCategoryID: number;
    TaskListID: number;
    Name: string;
    SortOrder: number;
    Tasks: FullTraineeTaskListTaskInfo[];

    Summary: TraineeGeneralSummaryInfo;

    GUIData: TaskListCategoryGUIData;
}
export interface FullTraineeTaskListTaskInfo {
    TaskID: number;
    TaskListID: number;
    TaskCategoryID: number;
    Name: string;
    FormID: number;
    SortOrder: number;

    CanHaveForm: boolean; // Not all tasks will require/allow for a form.

    HasTraineeFormRecords: boolean;
    TraineeFormRecords: TraineeFormRecordInfo[];

    Summary: TraineeGeneralSummaryInfo;

    GUIData: TaskListTaskGUIData;
}

export class TaskListCategoryGUIData {
    Expanded: boolean;
}

export class TaskListTaskGUIData {
    Expanded: boolean;
}

/******************************* FORM ****************************/
export class TraineeFormRecordInfo {
    RecordID: number = 0;
    UserID: number = 0;
    ShiftID: number = 0;
    PhaseID: number = 0;
    FormID: number = 0;
    TaskID: number = 0;
    Date: Date = null;
    FormOwners: string[] = [];
    IsArchived: boolean = false;
    ArchivedOnDate: Date = null;
    BasicFormInfo: BasicFormInfo = new BasicFormInfo();
    Summary: TraineeGeneralSummaryInfo = new TraineeGeneralSummaryInfo();
    HasSummary: boolean = false;
    Permissions: TraineeFormRecordPermissionsInfo = new TraineeFormRecordPermissionsInfo();
    SummaryRules: SummaryRuleInfo[] = [];
    TraineeDisplayName: string = '';
    UpdatedOnDate: Date = null;
}

export class TraineeFormRecordPermissionsInfo {
    CanEdit: boolean = false;
    CanSave: boolean = false;
}

export class BasicFormInfo {
    FormID: number = 0;
    ProgramID: number = 0;
    Name: string = '';
    Collapsible: boolean = false;
    CollapseBy: string = '';
    IncludeDateField: boolean = false;
    CanBeAddedManually: boolean = false;
    IncludeInPhaseForms: boolean = false;
    IncludeInAdminToDo: boolean = false;
    CanBeExported: boolean = false;
    SortOrder: number = 0;
    IsDeleted: boolean = false;   
}

export interface FormInfo extends BasicFormInfo {
    InstructionsEnabled: boolean;
    Instructions: string;
}


/******************************* SUMMARY *************************/
export interface GUIData {
    // Used for expansion
    Expanded: boolean;
    // Used for summary display
    Summary: SummaryInfo;
    // Used to display requirement indicator
    NeedsAttention: boolean;
}

export interface SummaryInfo {
    SummaryID: number;
    Status: StatusInfo;
    // Fields to control category summary visibility.
    ShowStatusCell: boolean;
    ShowFieldsMarkedCell: boolean;
    ShowScoreCell: boolean;
    ShowTrendCell: boolean;
    ShowSignatureCell: boolean;
    // END of Fields to control category summary visibility.
    ScoreStatus: StatusInfo;
    TotalScore: number;
    PossibleScore: number;
    Trend: number;
    Signatures: SignatureInfo[];
    TotalFieldsMarked: number;
    PossibleFieldsMarked: number;
}

export interface StatusInfo {
    Text: string;
    HoverText: string;
    Theme: string;
}

export interface SignatureInfo {
    SignatureName: string;
    SignatureReceived: boolean;
}

export class WarningMessage {
    public Message: string;
    public Color: string;

    constructor(message: string, color: string) {
        this.Message = message;
        this.Color = color;
    }
}