import { Component, OnInit } from '@angular/core';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { JobTrainingProvider } from '../../../Providers/Service';
import * as JobTrainingModel from '../../../Providers/Model';
import * as JT_FormsModel from '../../../Providers/Forms.Model';
import { JSONCloneService } from 'src/app/shared/Utilities/json-clone.service';
import { FormDesignerService } from '../form-designer.service';
import { ToastService } from 'src/app/shared/Toast.Service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';


// define component
@Component({
    selector: 'edit-form-field',
    templateUrl: 'form-field.component.html',
    styleUrls: ['../../../page.scss']
})

export class EditFormFieldComponent implements OnInit {
    // define service provider and route provider when component is constructed
    constructor(
        private navController: NavController,
        private route: ActivatedRoute,
        private toastService: ToastService,
        private loadingService: IonicLoadingService,
        private jobTrainingService: JobTrainingProvider,
        private jsonCloneService: JSONCloneService,
        private formDesignerService: FormDesignerService) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/

    // [categoryInfo] & [fieldInfo] - Local copy from the selected form's data. Detached from shared service on _init.
    public categoryInfo: JT_FormsModel.FormCategoryInfo;
    public fieldInfo: JT_FormsModel.FormFieldInfo;

    /**
     * [optionsWarnings] - Used to show any relevant warning messages in the GUI,
     * like "No data", "Invalid data", etc.
     */
    public optionsWarnings: JobTrainingModel.WarningMessage[];

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/
    // [_categoryID] & [_fieldID] set on _init from the route.
    private _categoryID: number;
    private _fieldID: number;

    /*******************************************
    * PUBLIC METHODS
    *******************************************/

    public onDisableFieldClick() {
        this.fieldInfo.IsDeleted = true;
    }

    public onEnableFieldClick() {
        this.fieldInfo.IsDeleted = false;
    }

    public onAddOptionClick() {
        /**
         * We use [unshift] to put the new object at the front of the array so the user can see it sooner
         * without having to scroll or whatever.
         */
        var newOptionInfo = new JT_FormsModel.FormFieldOptionInfo(this.fieldInfo.FieldID);
        this.fieldInfo.Options.unshift(newOptionInfo);

        // Recall [_onOptionsDatasetChanged] to fix calculated data.
        this._onOptionsDatasetChanged();
    }

    public onRemoveOptionClick(optionInfo: JT_FormsModel.FormFieldOptionInfo) {
        optionInfo.IsDeleted = true;
        /**
         * Use the PK to detemine if the object is an existing DB record or not.
         * If it's a new object that hasn't been submitted to the DB yet we'll delete it from
         * the data array entirely.
         */
        if (optionInfo.OptionID <= 0) {
            var optionIndex = this.fieldInfo.Options.indexOf(optionInfo);
            if (optionIndex !== -1) {
                // [Splice] 1 item at the [optionIndex] position.
                this.fieldInfo.Options.splice(optionIndex, 1);
                
            }
        }

        // Recall [_onOptionsDatasetChanged] to fix calculated data.
        this._onOptionsDatasetChanged();
    }

    public onRestoreOptionClick(optionInfo: JT_FormsModel.FormFieldOptionInfo) {
        optionInfo.IsDeleted = false;

        // Recall [_onOptionsDatasetChanged] to fix calculated data.
        this._onOptionsDatasetChanged();
    }

    /**
     * [onOptionReorder] handles the end event of the <ion-reorder-group>
     * Finish the reorder and position the item in the DOM based on
     * where the gesture ended. Update the items variable to the
     * new order of items.
     */
    public onOptionReorder(ev: any) {
        this.fieldInfo.Options = ev.detail.complete(this.fieldInfo.Options);
        this._updateOptionSortOrderUsingIndex();
    }

    /** 
     * The click event for the submit button. 
     * Validates data, sends to API.
     */
    public onSubmitClick() {
        this.loadingService.presentLoading('Saving changes...');
        // 1. [if valid] Send to service
        // 1.1 Maybe validation error from serverside - will get alerted to user.
        // 1.2. Submission success - reset cached data for all views on service.

        var programID = this.formDesignerService.selectedFormInfo.ProgramID;
        var formID = this.formDesignerService.selectedFormInfo.FormID;
        this.jobTrainingService.updateFormField(programID, formID, this._categoryID, this.fieldInfo).subscribe(
            (updatedFieldInfo: JT_FormsModel.FormFieldInfo) => {
                // Put the updated record back on the cached dataset.
                this._updateLocalCache(updatedFieldInfo);

                // Reclone the data for use in this tool.
                this._copyDataForLocalCache();

                this.loadingService.dismissLoading();

                this.toastService.presentToast('Field updated');
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    /**
     * [onCloseClick] - Handles the click event for the close button.
     * Tries to leave this route to clear any custom input the user may have added.
     * Leaving the route ought to set off the "discard changes" route guard.
     */
    public onCloseClick() {
        // Revert back to the "all fields" view for this category.
        var route = '/jobtraining'
            + '/programdetail/' + this.formDesignerService.selectedFormInfo.ProgramID
            + '/forms/' + this.formDesignerService.selectedFormInfo.FormID
            + '/category/' + this.categoryInfo.CategoryID
            + '/fields';
        this.navController.navigateRoot(route);
    }

    /*******************************************
    * PRIVATE METHODS
    *******************************************/

    private _onOptionsDatasetChanged() {
        this._updateOptionSortOrderUsingIndex();
        this._setOptionsWarningMessages();
    }

    private _updateOptionSortOrderUsingIndex() {
        //Loop all [Options] and update the [SortOrder] property.
        this.fieldInfo.Options.forEach((loopedOption, index) => {
            loopedOption.SortOrder = (index + 1); // + 1 for normal user friendly 1-based SortOrder values.      
        });
    }

    private _setOptionsWarningMessages() {
        this.optionsWarnings = [];
        // Case 1: Check if there are any records at all.
        const hasOptions = ((this.fieldInfo.Options.length > 0));
        if (!hasOptions) {
            this.optionsWarnings.push(new JobTrainingModel.WarningMessage('No options to have been added yet.', 'white'));
        }

        // Case 2: Check if there are any ACTIVE records.
        if (hasOptions) {
            let hasActiveOptions = false;
            this.fieldInfo.Options.forEach(loopedOption => {
                if (!loopedOption.IsDeleted) {
                    // There's at least one active record.
                    hasActiveOptions = true;
                }
            });
            if (!hasActiveOptions) {
                this.optionsWarnings.push(new JobTrainingModel.WarningMessage('There are no active options.', 'bootstrap-bg-warning'));
            }
        }
    }

    private _updateLocalCache(updatedFieldInfo: JT_FormsModel.FormFieldInfo) {
        /**
         * Called AFTER the records are updated via API calls.
         * Puts the updated data onto the local cache for use in other GUIs.
         */
        this.formDesignerService.selectedFormInfo.Categories.forEach(loopedCategory => {
            if (loopedCategory.CategoryID === this._categoryID) {
                loopedCategory.Fields.forEach((loopedField) => {
                    if (loopedField.FieldID === this._fieldID) {
                        /**
                         * Manually mapping each changed property because it was causing problems w/
                         * the form-display to just fully overwrite the full [loopedField] object.
                         */
                        loopedField.Text = updatedFieldInfo.Text;
                        loopedField.IsDeleted = updatedFieldInfo.IsDeleted;
                        loopedField.IsOptional = updatedFieldInfo.IsOptional;
                        loopedField.CanHaveFeedback = updatedFieldInfo.CanHaveFeedback;
                        loopedField.Options = updatedFieldInfo.Options;
                    }
                });
            }
        });
    }

    private _copyDataForLocalCache() {
        /**
         * Make a copy of needed [formDesignerService.selectedFormInfo] data so this view can freely edit it
         * without overwriting the source object.
         */
        this.formDesignerService.selectedFormInfo.Categories.forEach(loopedCategory => {
            if (loopedCategory.CategoryID === this._categoryID) {
                this.categoryInfo = this.jsonCloneService.cloneObject(loopedCategory);

                this.categoryInfo.Fields.forEach(loopedField => {
                    if (loopedField.FieldID === this._fieldID) {
                        this.fieldInfo = this.jsonCloneService.cloneObject(loopedField);
                    }
                });
            }
        });

        this._onOptionsDatasetChanged();
    }


    /*******************************************
    * SELF INIT
    *******************************************/
    ngOnInit() {
        this._categoryID = +this.route.snapshot.paramMap.get('categoryid');
        this._fieldID = +this.route.snapshot.paramMap.get('fieldid');

        this._copyDataForLocalCache();

        // Calling [setSelectedTabName] helps keep the selected tab/button activated if user refreshes page.
        this.formDesignerService.setSelectedTabName('categories');
    }
}