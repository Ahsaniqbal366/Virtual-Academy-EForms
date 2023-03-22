import * as JobTrainingModel from './Model';

export interface TraineeFormUpdatePayload {
    traineeFormRecordID: number;
    formDate: Date;
    entryInfo: TraineeFormEntryInfo[];
}

export interface FullFormInfo extends JobTrainingModel.FormInfo {
    InstructionsEnabled: boolean;
    Instructions: string;
    HasInstructions: boolean;
    Categories: FormCategoryInfo[];
    Likert: FormLikertInfo;
    HasLikert: boolean;
    TraineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo;
}


/******************************* CATEGORY ************************/
export class BasicFormCategoryInfo {
    CategoryID: number = 0;
    FormID: number = 0;
    Name: string = '';
    SortOrder: number = 0;
    IsDeleted: boolean = false;
    AutoOpen: boolean = false;
    CanCollapse: boolean = false;

    constructor(FormID: number) {
        this.FormID = FormID;
    }
}
export class FormCategoryInfo extends BasicFormCategoryInfo {
    // Used to create the form>category>field hierarchy
    Fields: FormFieldInfo[];

    HasTable: boolean;
    TableInfo: FormTableInfo;

    // Used for visual aids
    GUIData: CategoryGUIData;
}

export interface CategoryGUIData {
    // Used for expansion
    Expanded: boolean;
    // Used for summary display
    SummaryFlags: CategorySummaryFlags;
    Summary: CategorySummaryInfo;
    // Used to display requirement indicator
    NeedsAttention: boolean;
}

export interface CategorySummaryFlags {
    // Fields to control category summary visibility.
    ShowStatusCell: boolean;
    ShowFieldsMarkedCell: boolean;
    ShowScoreCell: boolean;
    ShowTrendCell: boolean;
    ShowSignatureCell: boolean;
}

export interface CategorySummaryInfo {
    SummaryID: number;
    Status: JobTrainingModel.TraineeGeneralSummaryStatusInfo;
    ScoreStatus: JobTrainingModel.TraineeGeneralSummaryStatusInfo;
    TotalScore: number;
    PossibleScore: number;
    Trend: number;
    Signatures: CategorySignatureInfo[];
    TotalFieldsMarked: number;
    PossibleFieldsMarked: number;
}

export interface CategorySignatureInfo {
    SignatureName: string;
    SignatureReceived: boolean;
}

/******************************* FORM TABLE ***************************/
export interface FormTableInfo {
    FormTableID: number;
    FormID: number;
    FormCategoryID: number;

    Rows: FormTableTableRowInfo[];
}
export interface FormTableTableRowInfo {
    FormTableRowID: number;
    FormTableID: number;
    SortOrder: number;

    Cells: FormTableTableCellInfo[];
}
export interface FormTableTableCellInfo {
    FormTableCellID: number;
    FormTableID: number;
    FormTableRowID: number;
    Text: string;
    HasFields: boolean;
    Fields: FormFieldInfo[];
    SortOrder: number;
    SizeXS: number;
    SizeSM: number;
    SizeMD: number;
    SizeLG: number;
    SizeXL: number;
}

/******************************* LIKERT ***************************/
export class FormLikertInfo {
    LikertID: number = 0;
    FormID: number = 0;
    PointsPossible: number = 0;
    IncludeLikertBelowFormInstructions: boolean = false;
    IsDeleted: boolean = false;
    Ratings: FormLikertRatingInfo[] = [];

    constructor(FormID: number) {
        this.FormID = FormID;
    }
}

export class FormLikertRatingInfo {
    RatingID: number = 0;
    LikertID: number = 0;
    Text: string = '';
    Score: number = 0;
    IsNumericScore: boolean = false;
    Description: string = '';
    ShowInTable: boolean = false;
    RequireFeedback: boolean = false;
    IsWarningScore: boolean = false;
    WarningMessage: string = '';
    WarningHoverMessage: string = '';
    SortOrder: number = 0;
    IsDeleted: boolean = false;

    constructor(LikertID: number) {
        this.LikertID = LikertID;
    }
}

/******************************* FIELD ***************************/

export interface FormFieldInfo {
    FieldID: number;
    CategoryID: number;
    FormID: number;
    FieldTypeID: number;
    Text: string;
    SortOrder: number;
    EditPermissionTypeID: number;
    CanHaveFeedback: boolean;
    // [ShowSignatureInfo] flag would control if we show who filled out the field on the GUI/Exports.
    ShowSignatureInfo: boolean;
    IsOptional: boolean;
    IsDeleted: boolean;

    FieldType: FormFieldTypeInfo;
    
    // [EntryInfo] - ngModel for the fields input Holds [EntryInfo.Value] for db storage
    EntryInfo: TraineeFormEntryInfo;
    Permissions: FormFieldEntryPermissionInfo;
    // [GUIData] - Used for GUI
    GUIData: FormFieldGUIData;
    // Stores the list of FormFieldOptions for use with 'DropDownList' or similar FieldType
    Options: FormFieldOptionInfo[];
}

export class FormFieldTypeInfo {
    FieldTypeID: number = 0;
    ProgramID: number = null;
    Type: string = '';
    FriendlyName: string = '';
    IsCustom: boolean = false;
    CanHaveOptions: boolean = false;
    IsReadOnly: boolean = false;
}

export class FormFieldOptionInfo {
    OptionID: number = 0;
    FieldID: number = 0;
    FormID: number = 0;
    Text: string = '';
    SortOrder: number = 0;
    IsDeleted: boolean = false;

    constructor(FieldID: number) {
        this.FieldID = FieldID;
    }
}

export class FormFieldEntryPermissionInfo {
    CanEdit: boolean = false;
}

export interface FormFieldGUIData {
    CanClearFeedback: boolean;
    HasFeedback: boolean;
    ShowFeedbackField: boolean;
    // Used to display requirement indicator
    Status: JobTrainingModel.TraineeGeneralSummaryStatusInfo;
}


/******************************* ENTRY ***************************/
// [Modified] is not original
export class TraineeFormEntryInfo {
    TraineeFormEntryID: number = 0;
    TraineeFormRecordID: number = 0;
    FormFieldID: number = 0;
    // string type data on c#
    Value: any = null;
    CreatedOnDate: Date = null;
    CreatedByUserID: number = 0;
    CreatedByDisplayName: string = '';
    UpdatedOnDate: Date = null;
    UpdatedByUserID: number = 0;
    UpdatedByDisplayName: string = '';
    Feedback: string = '';
    FeedbackDate: Date = null;
    FormEntryLinks: FormEntryLinkInfo[] = [];
    FormEntryLinkInput: string = '';
    FeedbackDocument: string = '';
    // Used to determine the need for a default message / value
    HasValue: boolean = false;
    // Used to determine if the entry is modified and requires storage
    Modified: boolean = false;
    // Used to determine if the CreatedBy and UpdatedBy data is different
    HasUpdated: boolean = false;
}


export interface FormEntryLinkInfo {
    FormEntryID: number;
    EntryID: number;
    URL: string;
    CreatedOnDate: Date;
    CreatedByUserID: number;
    UpdatedOnDate: Date;
    UpdatedByUserID: number;
    IsDeleted: boolean;
}
