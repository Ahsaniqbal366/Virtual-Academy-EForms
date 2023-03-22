import { Component, OnInit } from '@angular/core';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import * as JobTrainingModel from '../../../Providers/Model';
import * as JT_FormsModel from '../../../Providers/Forms.Model';
import { JSONCloneService } from 'src/app/shared/Utilities/json-clone.service';
import { FormDesignerService } from '../form-designer.service';
import { JobTrainingProvider } from 'src/app/JobTraining/Providers/Service';
import { ToastService } from 'src/app/shared/Toast.Service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';


// define component
@Component({
  selector: 'edit-form-category-fields',
  templateUrl: 'form-fields-list.component.html',
  styleUrls: ['../../../page.scss']
})

export class EditFormCategoryFieldsComponent implements OnInit {


  // define service provider and route provider when component is constructed
  constructor(
    private navController: NavController,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private loadingService: IonicLoadingService,
    private jsonCloneService: JSONCloneService,
    private jobTrainingService: JobTrainingProvider,
    private formDesignerService: FormDesignerService) {
  }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/

  // [categoryInfo] - Local copy from the selected form's data. Detached from shared service on _init.
  public categoryInfo: JT_FormsModel.FormCategoryInfo;

  // [warnings] - Used to show any relevant warning messages in the GUI. Like "No data", "Invalid data", etc.
  public warnings: JobTrainingModel.WarningMessage[];

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/
  private _categoryID: number; //[_categoryID] set on _init from the route.

  /*******************************************
  * PUBLIC METHODS
  *******************************************/
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
    this.jobTrainingService.updateCategoryFieldSortingAndDeletedStatus(programID, formID, this.categoryInfo.CategoryID, this.categoryInfo.Fields).subscribe(
      (updatedFormInfo: JT_FormsModel.FullFormInfo) => {
        // Overwrite [formDesignerService.selectedFormInfo] w/ the newly updated data.
        this.formDesignerService.selectedFormInfo = updatedFormInfo;

        this._copyDataForLocalCache();

        this.loadingService.dismissLoading();

        this.toastService.presentToast('Form fields updated');
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
    // Revert back to the "all categories" view.
    var route = '/jobtraining'
      + '/programdetail/' + this.formDesignerService.selectedFormInfo.ProgramID
      + '/forms/' + this.formDesignerService.selectedFormInfo.FormID
      + '/categories';
    this.navController.navigateRoot(route);
  }

  public onAddFieldClick() {
    // /**
    //  * We use [unshift] to put the new objet at the front of the array so the user can see it sooner
    //  * without having to scroll or whatever.
    //  */
    // this.fields.unshift(new FormFieldInfo(this.formDesignerService.selectedFormInfo.FormID));
    // // Recall [_updateFieldSortOrderUsingIndex] to fix sort orders now that the dataset has changed.
    // Recall [_onFieldsDataSetChange] to fix calculated data.
    // this._onFieldsDataSetChange();
  }

  public onEditFieldClick(fieldInfo: JT_FormsModel.FormFieldInfo) {
    var route = '/jobtraining'
      + '/programdetail/' + this.formDesignerService.selectedFormInfo.ProgramID
      + '/forms/' + this.formDesignerService.selectedFormInfo.FormID
      + '/category/' + this.categoryInfo.CategoryID
      + '/field/' + fieldInfo.FieldID;
    this.navController.navigateRoot(route);
  }

  /**
   * [onFieldReorder] handles the end event of the <ion-reorder-group>
   * Finish the reorder and position the item in the DOM based on
   * where the gesture ended. Update the items variable to the
   * new order of items.
   */
  public onFieldReorder(ev: any) {
    this.categoryInfo.Fields = ev.detail.complete(this.categoryInfo.Fields);
    this._updateFieldSortOrderUsingIndex();
  }

  public onRemoveFieldClick(fieldInfo: JT_FormsModel.FormFieldInfo) {
    fieldInfo.IsDeleted = true;
    /**
     * Use the object's PK to detemine if it's an existing DB record or not.
     * If it's a new record that hasn't been submitted to the DB yet we'll delete it from
     * the source array entirely.
     */
    if (fieldInfo.FieldID <= 0) {
      var objectIndex = this.categoryInfo.Fields.indexOf(fieldInfo);
      if (objectIndex !== -1) {
        // [Splice] 1 item at the [objectIndex] position.
        this.categoryInfo.Fields.splice(objectIndex, 1);        
      }
    }

    // Recall [_onFieldsDataSetChange] to fix calculated data.
    this._onFieldsDataSetChange();
  }

  public onRestoreFieldClick(fieldInfo: JT_FormsModel.FormFieldInfo) {
    fieldInfo.IsDeleted = false;

    // Recall [_onFieldsDataSetChange] to fix calculated data.
    this._onFieldsDataSetChange();
  }

  /*******************************************
  * PRIVATE METHODS
  *******************************************/


  private _onFieldsDataSetChange() {
    this._updateFieldSortOrderUsingIndex();
    this._setWarningMessages();
  }

  private _updateFieldSortOrderUsingIndex() {
    //Loop all [fields] and update the [SortOrder] property.
    this.categoryInfo.Fields.forEach((loopedField, index) => {
      loopedField.SortOrder = (index + 1); // + 1 for normal user friendly 1-based SortOrder values.      
    });
  }

  private _setWarningMessages() {
    this.warnings = [];
    // Case 1: Check if there are any records at all.
    const hasFields = ((this.categoryInfo.Fields.length > 0));
    if (!hasFields) {
      this.warnings.push(new JobTrainingModel.WarningMessage('No fields to have been added yet.', 'white'));
    }

    // Case 2: Check if there are any ACTIVE records.
    if (hasFields) {
      let hasActiveFields = false;
      this.categoryInfo.Fields.forEach(loopedField => {
        if (!loopedField.IsDeleted) {
          // There's at least one active record.
          hasActiveFields = true;
        }
      });
      if (!hasActiveFields) {
        this.warnings.push(new JobTrainingModel.WarningMessage('There are no active fields.', 'bootstrap-bg-warning'));
      }
    }
  }


  private _copyDataForLocalCache() {
    /**
     * Make a copy of needed [formDesignerService.selectedFormInfo] data so this view can freely edit it
     * without overwriting the source object.
     */
    this.formDesignerService.selectedFormInfo.Categories.forEach(loopedCategory => {
      if (loopedCategory.CategoryID === this._categoryID) {
        this.categoryInfo = this.jsonCloneService.cloneObject(loopedCategory);
      }
    });

    this._setWarningMessages();
  }

  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this._categoryID = +this.route.snapshot.paramMap.get('categoryid');

    this._copyDataForLocalCache();

    // Calling [setSelectedTabName] helps keep the selected tab/button activated if user refreshes page.
    this.formDesignerService.setSelectedTabName('categories');
  }

}