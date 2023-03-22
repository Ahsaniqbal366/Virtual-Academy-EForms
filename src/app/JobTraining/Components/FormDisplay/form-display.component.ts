import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { JobTrainingProvider } from '../../Providers/Service';
import { NavController } from '@ionic/angular';
import { IonicLoadingService } from '../../../shared/Ionic.Loading.Service';
import { ToastService } from '../../../shared/Toast.Service';
import { isNullOrUndefined, isUndefined } from 'is-what';

import * as JobTrainingModel from '../../Providers/Model';
import * as JT_FormsModel from '../../Providers/Forms.Model';


/*************************************** INTERNAL CLASS DEFINITIONS ***********************************/
class CategoryFieldCounts {
    // [PossibleFields] & [FieldsMarked] default to a value of 0.
    PossibleFields = 0;
    FieldsMarked = 0;
}

// define component
@Component({
    selector: 'form-display-component',
    templateUrl: 'form-display.component.html',
    styleUrls: [
        '../../page.scss',
        './form-display.component.scss'
    ]
})

/** 
 * This component is for the detail view after clicking opening form.
 * It's used to "preview" a form as well as actually fill out a form for a user.
 */
export class FormDisplayComponent implements OnInit {

    @Input() formInfo: JT_FormsModel.FullFormInfo;
    @Input() isPreviewMode: boolean;

    //[recordid] is set on init as the route params are parsed.
    recordid: number;

    // Defines the maxlength attribute of the feedback fields
    MAX_FEEDBACK_LENGTH = 1000;

    /**
     * During auto-validation, we're adding an additional 7 characters (http://), now, making the limit for [FormEntryLinkIUnput]
     * only 393 characters. If we exceed this, we'll not be able to save the link and muct alert the user of this
     */
    MAX_LINK_LENGTH = 393;

    // define service provider and route provider when component is constructed
    constructor(
        public jobTrainingService: JobTrainingProvider,
        // NavController allows for the [navigateBack] method which plays the native back animation
        public navController: NavController,
        public loadingService: IonicLoadingService,
        public toastService: ToastService
    ) { }

    /*************************************** AUTO ***********************************/

    ngOnInit() {
        /**
         * We don't do anything here in [ngOnInit]. Self-init of the given [formInfo] @Input data
         * is handled through [ngOnChanges].
         */
    }

    /**
     * [ngOnChanges] watches for changes to the @Input data.
     * This is most useful on the form designer's preview mode which might frequently change [this.formInfo]
     * as the user updates the form.
     */
    ngOnChanges(changes: SimpleChanges) {
        this._init();
    }

    /*************************************** INIT ***********************************/

    private _init() {
        if (this.isPreviewMode) {
            /**
             * Setup fake [TraineeFormRecord] & [Field.EntryInfo]. 
             * [isPreviewMode] is like when the form display is loaded into the FormDesigner view.
             * We won't have a trainee or entry data in this case.
             */
            this.formInfo.TraineeFormRecordInfo = new JobTrainingModel.TraineeFormRecordInfo();
            this.formInfo.Categories.forEach((loopedCategory) => {
                const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(loopedCategory);
                categoryFields.forEach((loopedField) => {
                    loopedField.Permissions = new JT_FormsModel.FormFieldEntryPermissionInfo();
                    loopedField.EntryInfo = new JT_FormsModel.TraineeFormEntryInfo();
                });
            });
        }

        // Setup the entry objects to return
        this.initFormFieldEntries();
        // Calculate summary info
        this.initCompleteSummaryInfo();
    }

    updateDate(newDate: string) {
        this.formInfo.TraineeFormRecordInfo.Date = new Date(newDate);
    }
    /** Init entry objects for the form's fields, either existing loaded entries or blank ones */
    initFormFieldEntries() {
        // Build a blank entry object for any field without one
        this.formInfo.Categories.forEach((category) => {
            // Set a blank GUIData property with blank Summary and Status
            category.GUIData = { Summary: { Status: {} } } as JT_FormsModel.CategoryGUIData;
            /**
             * Some categories will be set to auto-expand. This is controlled via the API/DB.
             * A common example of this is the "Signatures" category at the top of a daily observation report.
             */
            if (category.AutoOpen) {
                category.GUIData.Expanded = true;
            }
            const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(category);
            categoryFields.forEach((field) => {
                // Set a blank GUIData property with blank Summary and Status
                field.GUIData = {
                    ShowFeedbackField: false,
                    CanClearFeedback: false,
                    Status: {}
                } as JT_FormsModel.FormFieldGUIData;

                /**
                 * Reinforce [CanHaveFeedback] here w/ the [CanEdit] flag.
                 * [CanHaveFeedback] will frequently be true during the "preview" mode of the form
                 * display, but we don't wanna be showing "add feedback" buttons in that case.
                 */
                if (!field.Permissions.CanEdit) {
                    field.CanHaveFeedback = false;
                }

                if (field.CanHaveFeedback) {
                    field.GUIData.CanClearFeedback = true;
                }
                /**
                 * Feedback field is shown for fields that already had feedback.
                 * User won't be able to edit the feedback if they cannot edit the field.
                 * ----
                 * Special 'Likert' required feedback logic is handled later in the code.
                 */
                field.GUIData.HasFeedback = !(isNullOrUndefined(field.EntryInfo.Feedback) || (field.EntryInfo.Feedback.length === 0))
                    || !(isNullOrUndefined(field.EntryInfo.FormEntryLinks) || (field.EntryInfo.FormEntryLinks.length === 0));
                field.GUIData.ShowFeedbackField = field.GUIData.HasFeedback;

                // parse the existing value to work for the ngModel, if needed
                switch (field.FieldType.Type) {
                    case 'Textarea':
                    case 'Textbox':
                    case 'YesNo':
                    case 'DatePicker':
                    case 'DateTimePicker':
                    case 'Number':
                    case 'TaskName':
                        /**
                         * Do nothing for the types in this case.
                         * [field.EntryInfo] should be a string already,
                         * and no other manipulation needs to happen at this time.
                         */
                        break;
                    case 'ReportTable':
                        // 'ReportTable' entry value's are serialized. Let's unpack that JSON for use in the GUI.
                        field.EntryInfo.Value = JSON.parse(field.EntryInfo.Value);
                        break;

                    default:
                        /**
                         * Somehow signature fields were defaulting to "checked" when [field.EntryInfo] was
                         * an empty string. We can default that value to false now.
                         */
                        if (field.FieldType.Type === 'Signature') {
                            if (field.EntryInfo.Value === '') {
                                field.EntryInfo.Value = false;
                            }
                        }
                        // String values for fields like the integers belonging to likerts, do require parsing.
                        if (typeof field.EntryInfo.Value === 'string' && field.EntryInfo.Value !== '') {
                            field.EntryInfo.Value = JSON.parse(field.EntryInfo.Value);
                        }
                        break;
                }
                field.EntryInfo.Modified = false;
            }); // End forEach existing entries
        }); // End forEach form categories
    }


    /*************************************** SAVE ***********************************/

    /** Gather all entries that are flagged as Modified to be saved */
    public gatherAllModifiedEntries(): JT_FormsModel.TraineeFormEntryInfo[] {
        const traineeFormEntries = [];
        this.formInfo.Categories.forEach((category) => {
            const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(category);
            categoryFields.forEach((field) => {
                // For any field with a modified entry, add it to be stored
                if (field.EntryInfo && field.EntryInfo.Modified) {
                    // Ensure no unadded link in the link input is left behind
                    if (!isNullOrUndefined(field.EntryInfo.FormEntryLinkInput) && field.EntryInfo.FormEntryLinkInput.length > 0) {
                        field.EntryInfo = this._addLink(field.EntryInfo);
                    }
                    // Strigify the value to store if not already a string or null
                    const entryToAdd = { ...field.EntryInfo };
                    if (typeof entryToAdd.Value !== 'string'
                        && typeof entryToAdd.Value !== 'undefined'
                        && entryToAdd.Value !== null) {
                        entryToAdd.Value = JSON.stringify(entryToAdd.Value);
                    }

                    // Add it to [traineeFormEntries] array to be sent to API.
                    traineeFormEntries.push(entryToAdd);
                }
            });
        });

        return traineeFormEntries;
    }

    /**
     * [_resetAllModifiedEntryFlags]
     * ----
     * Resets [Modified] flag for each relevant entry so the user can start editing again in a new session.
     * Called AFTER form is successfully saved. This is so the user can try to save again in
     * the event of some unexpected error.
     */
    public resetAllModifiedEntryFlags() {
        this.formInfo.Categories.forEach((category) => {
            const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(category);
            categoryFields.forEach((field) => {
                // For any field with a modified entry, add it to be stored
                if (field.EntryInfo && field.EntryInfo.Modified) {
                    field.EntryInfo.Modified = false;
                }
            });
        });
    }

    /** Change event for default entries, used to gather accurate summary info and ensure they're saved */
    onModifyEntry(event: Event, field: JT_FormsModel.FormFieldInfo, category: JT_FormsModel.FormCategoryInfo) {
        /**
         * [setTimeout] is needed because checkbox element values aren't kept 100% in sync
         * as needed. We have issues w/ the value being FALSE after the user
         * checked the box, and we're fully expecting it to be TRUE.
         * ----
         * https://stackoverflow.com/questions/43339450/angular-2-checkbox-not-kept-in-sync/43339577#43339577
         */
        setTimeout(() => {
            /**
             * Checking for [event] to ensure this was a user triggered change event.
             * Part of the data _init code will mistakenly trigger this fxn as we parse and prepare
             * data for use in the GUI. I'm looking at you Likerts.
             */
            if (!isUndefined(event)) {
                field.EntryInfo.Modified = true;
                this.summarizeField(field, category);
                // As of 02/21/2020 this is for the Signature field type
                this._setCreatedByData(field);
            }
        }, 0);
    }

    /** A unique case of a simple autosizing text area */
    onModifyTextAreaEntry(
        field: JT_FormsModel.FormFieldInfo,
        category: JT_FormsModel.FormCategoryInfo,
        event: Event) {
        /** https://forum.ionicframework.com/t/solved-ion-textarea-resize-height-dynamically/80885/17
         *     TODO Perhaps use a directive like
         *     https://www.npmjs.com/package/ngx-autosize
         */
        const element = event.target as Element;
        element.setAttribute('style', 'height: \'auto\'');
        element.setAttribute('style', 'height: ' + element.scrollHeight + 'px');
        this.onModifyEntry(event, field, category);
    }

    /** Unique case for feedback links so that no summary adjustments are made but the entry is still flagged as [Modified] */
    onModifyFeedbackLinks(entryInfo: JT_FormsModel.TraineeFormEntryInfo) {
        entryInfo.Modified = true;
    }


    private _setCreatedByData(field: JT_FormsModel.FormFieldInfo) {
        /** Update this field's Entry info created/updated by info
         * We know that if [CreatedByUserID] == 0 then this field
         * has not been updated. If it's never been filled, that's fine too, because the null dates
         * will still match
         */
        if (isNullOrUndefined(field.EntryInfo.CreatedByUserID) || field.EntryInfo.CreatedByUserID === 0) {
            // this is not an update
            field.EntryInfo.HasValue = !isNullOrUndefined(field.EntryInfo.Value) && field.EntryInfo.Value.length !== 0;
            field.EntryInfo.HasUpdated = false;

            field.EntryInfo.CreatedByUserID = this.jobTrainingService.serverInfo.BasicUserInfo.UserID;
            field.EntryInfo.CreatedByDisplayName = this.jobTrainingService.serverInfo.BasicUserInfo.DisplayName;
            field.EntryInfo.CreatedOnDate = new Date();
        } else {
            // this is an update
            field.EntryInfo.HasValue = !isNullOrUndefined(field.EntryInfo.Value) && field.EntryInfo.Value.length !== 0;
            field.EntryInfo.HasUpdated = true;

            field.EntryInfo.UpdatedByUserID = this.jobTrainingService.serverInfo.BasicUserInfo.UserID;
            field.EntryInfo.UpdatedByDisplayName = this.jobTrainingService.serverInfo.BasicUserInfo.DisplayName;
            field.EntryInfo.UpdatedOnDate = new Date();
        }

        // Consider a false signature value a lack of a value
        if (field.FieldType.Type === 'Signature') {
            if (field.EntryInfo.Value === false) {
                field.EntryInfo.HasValue = false;
            }
        }
    }

    /** Take the given EntryInfo object and add the current [FormEntryLinkkInput] to
     * [FormEntryLinks]. Return the new EntryInfo, if needed for updating the ngModel.
     *
     * Also, validate links, they should begin with http:// or https:// no matter what
     */
    private _addLink(entryInfo: JT_FormsModel.TraineeFormEntryInfo): JT_FormsModel.TraineeFormEntryInfo {
        if (!isNullOrUndefined(entryInfo.FormEntryLinkInput) && entryInfo.FormEntryLinkInput.length > 0) {
            // Ensure this entry has an empty array instead of a null / undefined value
            if (isNullOrUndefined(entryInfo.FormEntryLinks)) {
                entryInfo.FormEntryLinks = [];
            }

            // Validate that this url will work, assuming it's a real url.
            const httpRegex = /^(http:\/\/)|(https:\/\/)/gi;
            if (httpRegex.exec(entryInfo.FormEntryLinkInput) == null) {
                entryInfo.FormEntryLinkInput = 'http://' + entryInfo.FormEntryLinkInput;
            }

            // Add [entryInfo.FormEntryLinkInput] to the list [entryInfo.FormEntryLinks]
            entryInfo.FormEntryLinks.push({
                URL: entryInfo.FormEntryLinkInput
            } as JT_FormsModel.FormEntryLinkInfo);

            // Clear [entryInfo.FormEntryLinkInput]
            entryInfo.FormEntryLinkInput = '';

            // Return the modified object, in case it was not the ngModel we can update with this.
            return entryInfo;
        }
    }

    onAddLinkClick(entryInfo: JT_FormsModel.TraineeFormEntryInfo) {
        if (!isNullOrUndefined(entryInfo.FormEntryLinkInput) && entryInfo.FormEntryLinkInput.length > 0) {
            entryInfo = this._addLink(entryInfo);
        } else {
            // Toast the user that their input is required
            this.toastService.presentToast('Type a link into the field before clicking "Add Link"');
        }
    }

    onRemoveLinkClick(entryInfo: JT_FormsModel.TraineeFormEntryInfo, link: JT_FormsModel.FormEntryLinkInfo) {
        link.IsDeleted = true;
        entryInfo.Modified = true;
    }

    /*************************************** SUMMARY ************************************/
    /** Calculate the complete summary object for the category specified, or for all categories if null is
     * passed in
     */
    initCompleteSummaryInfo() {
        this.formInfo.Categories.forEach((category) => {
            if (category.HasTable) {
                category.GUIData.SummaryFlags = {
                    ShowStatusCell: true,
                    ShowFieldsMarkedCell: true,
                    ShowScoreCell: true,
                    ShowTrendCell: false,
                    ShowSignatureCell: false
                } as JT_FormsModel.CategorySummaryFlags;
            } else {
                category.GUIData.SummaryFlags = {
                    ShowStatusCell: true,
                    ShowFieldsMarkedCell: true,
                    ShowScoreCell: true,
                    ShowTrendCell: false,
                    ShowSignatureCell: true
                } as JT_FormsModel.CategorySummaryFlags;
            }

            category.GUIData.Summary = {} as JT_FormsModel.CategorySummaryInfo;
            if (category.GUIData.SummaryFlags.ShowStatusCell) {
                category.GUIData.Summary.Status = this.getStatus(category);
            }
            if (category.GUIData.SummaryFlags.ShowFieldsMarkedCell) {
                // [onlyCountEditableFields] as false so that all fields will be counted.
                const onlyCountEditableFields = false;
                const fieldCounts = this.getTotalFieldsMarked(category, onlyCountEditableFields);
                category.GUIData.Summary.PossibleFieldsMarked = fieldCounts.PossibleFields;
                category.GUIData.Summary.TotalFieldsMarked = fieldCounts.FieldsMarked;
            }
            if (category.GUIData.SummaryFlags.ShowScoreCell) {
                category.GUIData.Summary.ScoreStatus = this.getScoreStatus(null, category);
                category.GUIData.Summary.PossibleScore = this.getPossibleScore(category);
                category.GUIData.Summary.TotalScore = this.getTotalScore(category);
            }
            if (category.GUIData.SummaryFlags.ShowSignatureCell) {
                category.GUIData.Summary.Signatures = this.getSignatures(category);
            }
            if (category.GUIData.SummaryFlags.ShowTrendCell) {
                category.GUIData.Summary.Trend = this.getTrend(category);
            }
        });
    }

    /** This summarizes the field modified without wasting time on the others, if not neccessary */
    summarizeField(
        field: JT_FormsModel.FormFieldInfo,
        category: JT_FormsModel.FormCategoryInfo
    ) {

        // All field types could require a fields marked check and a basic status message update.
        if (category.GUIData.SummaryFlags.ShowStatusCell) {
            category.GUIData.Summary.Status = this.getStatus(category);
        }
        if (category.GUIData.SummaryFlags.ShowFieldsMarkedCell) {
            // [onlyCountEditableFields] as false so that all fields will be counted.
            const onlyCountEditableFields = false;
            const fieldCounts = this.getTotalFieldsMarked(category, onlyCountEditableFields);
            category.GUIData.Summary.TotalFieldsMarked = fieldCounts.FieldsMarked;
        }

        // Determine the necessary updates based on the field type.
        switch (field.FieldType.Type) {
            case 'Signature': {
                if (category.GUIData.SummaryFlags.ShowSignatureCell) {
                    category.GUIData.Summary.Signatures = this.getSignatures(category);
                }
                break;
            }
            case 'Likert': {
                if (category.GUIData.SummaryFlags.ShowScoreCell) {
                    category.GUIData.Summary.ScoreStatus = this.getScoreStatus(field, category);
                    category.GUIData.Summary.TotalScore = this.getTotalScore(category);
                    category.GUIData.Summary.PossibleScore = this.getPossibleScore(category);
                }
                break;
            }
            // All others just require a fields marked check and a basic status message update.
            default: {
                break;
            }
        }
    }

    /** Return a status message and them specific to the score of likert fields */
    getScoreStatus(fieldSpecified: JT_FormsModel.FormFieldInfo, category: JT_FormsModel.FormCategoryInfo)
        : JobTrainingModel.TraineeGeneralSummaryStatusInfo {
        let returnStatus = {} as JobTrainingModel.TraineeGeneralSummaryStatusInfo;
        const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(category);
        categoryFields.filter((fieldToFilter) => {
            if (fieldSpecified) {
                return fieldToFilter === fieldSpecified;
            } else {
                return fieldToFilter;
            }
        }).forEach((field) => {
            if (field.FieldType.Type === 'Likert') {
                /**
                 * Likert may be disabled (or not even set up yet), so we check [HasLikert] here
                 * before trying to access & loop the likert & ratings.
                 */
                if (this.formInfo.HasLikert) {
                    this.formInfo.Likert.Ratings.forEach((rating) => {
                        if ((rating.IsWarningScore)
                            && (rating.RatingID === field.EntryInfo.Value)) {
                            returnStatus = {
                                ActionRequired: true,
                                Text: rating.WarningMessage,
                                HoverText: rating.WarningHoverMessage,
                                Theme: 'danger',
                                CSSClass: 'category-error',
                                HasError: true
                            } as JobTrainingModel.TraineeGeneralSummaryStatusInfo;
                        } // end [likertRating.IsWarningScore] check.
                    });
                } // end [form.HasLikert] check.
            } //end [field.FieldType.Type] === 'Likert' check.
        });
        return returnStatus;
    }

    /** (Future feature) Pull summary info regarding previous forms of this type to determine current trend */
    getTrend(category: JT_FormsModel.FormCategoryInfo): number {
        return 0;
    }

    /** Get the highest priority status message for this category. */
    getStatus(category: JT_FormsModel.FormCategoryInfo): JobTrainingModel.TraineeGeneralSummaryStatusInfo {
        /**
         * Check a few things, in order of priority.
         * Case 1. fields have errors
         * Case 2. Likerts may require feedback.
         * Case 3. See if all fields were marked.
         * Case 4. No action required.
         *
         * When [returnStatus] gets set the [hasStatus] flag will also be set to true
         * to prevent lower priority cases from running/overwriting [returnStatus].
         */
        let returnStatus = {} as JobTrainingModel.TraineeGeneralSummaryStatusInfo;
        let hasStatus = false;
        const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(category);
        categoryFields.forEach((field) => {
            field.GUIData.Status = {
                ActionRequired: false,
                Text: '',
                HoverText: '',
                Theme: '',
                CSSClass: '',
                HasError: false
            } as JobTrainingModel.TraineeGeneralSummaryStatusInfo;

            // Entering 'e' on the Number field results in the value being null, alert the user.
            if (field.FieldType.Type === 'Number'
                && field.EntryInfo.Modified
                && field.EntryInfo.Value == null) {
                field.GUIData.Status = {
                    ActionRequired: true,
                    Text: 'Invalid Input',
                    HoverText: 'The entered input is invalid and will not be saved',
                    Theme: 'danger',
                    CSSClass: 'field-error',
                    HasError: true
                } as JobTrainingModel.TraineeGeneralSummaryStatusInfo;
            }

            // Case 1. Field(s) have errors
            if (field.GUIData.Status.HasError) {
                returnStatus = {
                    ActionRequired: true,
                    Text: 'Error(s) need to be corrected, unable to save',
                    HoverText: 'field(s) contain errors and need to be corrected before you may save',
                    Theme: 'danger',
                    CSSClass: 'category-error',
                    HasError: true
                } as JobTrainingModel.TraineeGeneralSummaryStatusInfo;
                hasStatus = true;
            }

            // Case 2. Likerts may require feedback, high priority.
            if (field.FieldType.Type === 'Likert') {
                field.GUIData.HasFeedback = !(isNullOrUndefined(field.EntryInfo.Feedback) || (field.EntryInfo.Feedback.length === 0))
                    // If there's no feedback but there is hyperlinks, still consider this as [HasFeedback]
                    || !(isNullOrUndefined(field.EntryInfo.FormEntryLinks) || (field.EntryInfo.FormEntryLinks.length === 0));

                /**
                 * Likert may be disabled (or not even set up yet), so we check [HasLikert] here
                 * before trying to access & loop the likert & ratings.
                 */
                if (this.formInfo.HasLikert) {
                    this.formInfo.Likert.Ratings.forEach((loopedRating) => {
                        // Check if the user selected this [loopedRating].
                        if (!isNullOrUndefined(field.EntryInfo.Value) && loopedRating.RatingID.toString() === field.EntryInfo.Value.toString()) {
                            /**
                             * If this rating requires feedback and is the selected rating, ensure feedback was entered.
                             */
                            if (loopedRating.RequireFeedback) {
                                /**
                                 * Feedback field will be shown and cannot be cleared normally in this case because
                                 * feedback is "required" here.
                                 */
                                field.GUIData.ShowFeedbackField = true;
                                field.GUIData.CanClearFeedback = false;

                                if (!field.GUIData.HasFeedback && field.Permissions.CanEdit) {
                                    // This field is lacking feedback, flag that in GUIData.
                                    returnStatus = {
                                        ActionRequired: true,
                                        Text: 'Feedback Required',
                                        HoverText: 'Feedback is required for the given rating',
                                        Theme: 'warning',
                                        CSSClass: 'category-error',
                                        HasError: true
                                    } as JobTrainingModel.TraineeGeneralSummaryStatusInfo;

                                    field.GUIData.Status = {
                                        ActionRequired: true,
                                        Text: 'Feedback Required',
                                        HoverText: 'Feedback is required for the given rating',
                                        Theme: 'warning',
                                        CSSClass: 'field-incomplete',
                                        HasError: false
                                    } as JobTrainingModel.TraineeGeneralSummaryStatusInfo;

                                    hasStatus = true;
                                }
                            }
                            else {
                                /**
                                 * The looped rating doesn't require feedback.
                                 * ----
                                 * Don't just immediately clear & hide the feedback field.
                                 * If feedback was entered by the user we want to give them a chance to manually remove
                                 * that feedback using the "Clear" button.
                                 */
                                if (!field.GUIData.HasFeedback) {
                                    field.GUIData.ShowFeedbackField = false;
                                }
                                // Reset [CanClearFeedback]. User can clean feedback now, if they can edit this field.
                                field.GUIData.CanClearFeedback = field.Permissions.CanEdit;
                            }// end [loopedRating.RequireFeedback] if/else blocks.
                        } // end [entry.Value] === [loopedRating.RatingID] match check.
                    }); // end [likert.Ratings] loop.
                } // end [form.HasLikert] check.
            } // end [field.FieldTypeID] === 'Likert' check.
        });

        /**
         * Case 3. See if all fields were marked.
         * [!hasStatus] will show that previous cases didn't set the status.
         */
        // [onlyCountEditableFields] as true so that only the fields the user can edit will be counted.
        const onlyCountEditableFields = true;
        const fieldCounts = this.getTotalFieldsMarked(category, onlyCountEditableFields);
        if (!hasStatus
            && fieldCounts.FieldsMarked < fieldCounts.PossibleFields) {
            returnStatus = {
                ActionRequired: true,
                Text: 'Fields need to be marked',
                HoverText: 'All fields in this category must be marked',
                Theme: 'warning',
                CSSClass: 'category-error',
                HasError: true
            } as JobTrainingModel.TraineeGeneralSummaryStatusInfo;
            hasStatus = true;
        }

        // Case 4. No action required.
        if (!hasStatus) {
            returnStatus = {
                ActionRequired: false,
                Text: 'No action required',
                HoverText: 'All fields are marked and any applicable comments have been entered',
                Theme: 'clear', //'clear', AKA transparent.
                CSSClass: '',
                HasError: false
            } as JobTrainingModel.TraineeGeneralSummaryStatusInfo;
        }

        return returnStatus;
    }

    /** Get signature information for a category */
    getSignatures(category: JT_FormsModel.FormCategoryInfo): JT_FormsModel.CategorySignatureInfo[] {
        const signaturesToReturn = [];

        const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(category);
        categoryFields.forEach((field) => {
            if (field.FieldType.Type === 'Signature') {
                const signatureToAdd = {
                    SignatureReceived: field.EntryInfo.Value,
                    SignatureName: field.Text
                } as JT_FormsModel.CategorySignatureInfo;
                signaturesToReturn.push(signatureToAdd);
            }
        });

        return signaturesToReturn;
    }

    /** Get total score for all fields (lekerts) in the category */
    getTotalScore(category: JT_FormsModel.FormCategoryInfo): number {
        let currentScore = 0;
        /**
         * Likert may be disabled (or not even set up yet), so we check [HasLikert] here
         * before trying to access & loop the likert & ratings.
         */
        if (this.formInfo.HasLikert) {
            const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(category);
            // Remove non likerts
            const likertFields = categoryFields.filter((field) => {
                return field.FieldType.Type === 'Likert';
            });



            likertFields.forEach((field) => {
                const selectedRating = this.formInfo.Likert.Ratings.filter((rating) => {
                    return rating.RatingID === field.EntryInfo.Value;
                })[0];
                if (selectedRating && selectedRating.Score > 0) {
                    currentScore += selectedRating.Score;
                }
            });
        }

        return currentScore;
    }

    /**
     * [getTotalFieldsMarked] - Get the total number of fields the user has marked for the given [category].
     * -----
     * [onlyCountEditableFields] flag is used to keep incorrect action/status messages from showing up
     * when the user cannot fill out the empty fields.
     */
    getTotalFieldsMarked(category: JT_FormsModel.FormCategoryInfo, onlyCountEditableFields: boolean): CategoryFieldCounts {
        const counts = new CategoryFieldCounts();

        const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(category);
        categoryFields.forEach((field) => {
            /**
             * Based on the [onlyCountEditableFields] flag param, we may not count some fields if the user
             * cannot edit them.
             */
            let doCountField = true;
            if (onlyCountEditableFields && !field.Permissions.CanEdit) {
                doCountField = false;
            } else if (field.FieldType.IsReadOnly) {
                // Exclude [IsReadOnly] fields.
                doCountField = false;
            }
            if (doCountField) {
                // Determine if it counts and is filled.
                let marked = true;

                // Don't overwrite an error status
                if (field.GUIData.Status.Theme !== 'danger') {
                    if (!field.EntryInfo || !field.EntryInfo.Value) {
                        marked = false;
                        // Only set [NeedsAttention] status if user CAN edit the field.
                        if (field.Permissions.CanEdit) {
                            field.GUIData.Status.ActionRequired = true;
                            field.GUIData.Status.Text = 'Input Required';
                            field.GUIData.Status.HoverText = 'You must fill out this field';
                            field.GUIData.Status.Theme = 'warning';
                        }
                    }
                }

                counts.PossibleFields++;
                if (marked) {
                    counts.FieldsMarked++;
                }
            }

        });

        return counts;
    }

    /** Get possible score by multiplying number of likert fields by total likert possible score
     * Hides the score cell if no likert fields exist
     */
    getPossibleScore(category: JT_FormsModel.FormCategoryInfo): number {
        /**
         * Off the bat, we know if this form lacks a likert, there's no scoring involved.
         * --------
         * Likert may be disabled (or not even set up yet), so we check [HasLikert] here
         * before trying to access & loop the likert & ratings.
         */
        if (this.formInfo.HasLikert) {
            let currentPossibleScore = 0;
            const categoryFields: JT_FormsModel.FormFieldInfo[] = this._getCategoryFields(category);
            const likertFields = categoryFields.filter((field) => {
                return field.FieldType.Type === 'Likert';
            });

            // And if there's no [likertFields], then there's no scoring involved
            if (likertFields.length > 0) {
                category.GUIData.SummaryFlags.ShowScoreCell = true;

                likertFields.forEach((field) => {
                    const selectedRating = this.formInfo.Likert.Ratings.filter((rating) => {
                        return rating.RatingID === field.EntryInfo.Value;
                    })[0];

                    if (!selectedRating || selectedRating.IsNumericScore) {
                        currentPossibleScore += this.formInfo.Likert.PointsPossible;
                    }
                });
            } else {
                category.GUIData.SummaryFlags.ShowScoreCell = false;
            }
            return currentPossibleScore;
        } else {
            // Flag the category summary to not [ShowScoreCell]
            category.GUIData.SummaryFlags.ShowScoreCell = false;
            return 0;
        }
    }

    private _getCategoryFields(category: JT_FormsModel.FormCategoryInfo)
        : JT_FormsModel.FormFieldInfo[] {
        let foundFields: JT_FormsModel.FormFieldInfo[] = [];
        if (category.HasTable) {
            category.TableInfo.Rows.forEach(loopedRow => {
                loopedRow.Cells.forEach(loopedCell => {
                    if (loopedCell.HasFields) {
                        foundFields = foundFields.concat(loopedCell.Fields);
                    }
                });
            });
        } else {
            foundFields = category.Fields;
        }
        return foundFields;
    }

    /***************************** GUI **************************************/
    /** Click event for the expandable card of categories */
    expandCategory(category, event: Event): void {
        if (category.GUIData.Expanded) {
            if (category.CanCollapse) {
                category.GUIData.Expanded = false;
            }
        } else {
            this.formInfo.Categories.map(listItem => {
                if (category === listItem) {
                    listItem.GUIData.Expanded = !listItem.GUIData.Expanded;
                } else {
                    if (listItem.CanCollapse) {
                        listItem.GUIData.Expanded = false;
                    }
                }
                return listItem;
            });
        }

        // Autoscrolling the screen to the clicked category header.
        const element = event.target as HTMLElement;

        // This timeout ensures the scrolling happens after the expansion fully, so that the location scrolled
        // to is the new location, after any above elements have collapsed.
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }, 100);

    }

    /**
     * [onAddFeedbackClick] is the click event for the "Add Feedback" button that is available
     * for most field types in the GUI.
     *
     * Sets flag to show the feedback GUI, if possible.
     */
    public onAddFeedbackClick(field: JT_FormsModel.FormFieldInfo) {
        if (field.CanHaveFeedback) {
            field.GUIData.ShowFeedbackField = true;
        }
    }
    public onClearFeedbackClick(field: JT_FormsModel.FormFieldInfo) {
        if (field.GUIData.CanClearFeedback) {
            field.EntryInfo.Feedback = '';
            field.EntryInfo.FeedbackDate = null;
            field.GUIData.ShowFeedbackField = false;
        }
    }
}
