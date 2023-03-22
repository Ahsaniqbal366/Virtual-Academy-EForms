import { Component, OnInit } from '@angular/core';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import * as JobTrainingModel from '../../../Providers/Model';
import * as JT_FormsModel from '../../../Providers/Forms.Model';
import { JSONCloneService } from 'src/app/shared/Utilities/json-clone.service';
import { FormDesignerService } from '../form-designer.service';
import { JobTrainingProvider } from 'src/app/JobTraining/Providers/Service';
import { ToastService } from 'src/app/shared/Toast.Service';
import { NavController } from '@ionic/angular';


// define component
@Component({
  selector: 'edit-form-categories',
  templateUrl: 'form-categories.component.html',
  styleUrls: ['../../../page.scss']
})

export class EditFormCategoriesComponent implements OnInit {


  // define service provider and route provider when component is constructed
  constructor(
    private toastService: ToastService,
    private navController: NavController,
    private loadingService: IonicLoadingService,
    private jsonCloneService: JSONCloneService,
    private jobTrainingService: JobTrainingProvider,
    private formDesignerService: FormDesignerService) {
  }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/

  // [categories] - Local copy from the selected form's data. Detached from shared service on _init.
  public categories: JT_FormsModel.BasicFormCategoryInfo[];

  // Used to show any relevant warning messages in the GUI. Like "No data", "Invalid data", etc.
  public warnings: JobTrainingModel.WarningMessage[];

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

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
    this.jobTrainingService.updateFormCategories(programID, formID, this.categories).subscribe(
      (updatedFormInfo: JT_FormsModel.FullFormInfo) => {
        // Overwrite [formDesignerService.selectedFormInfo] w/ the newly updated data.
        this.formDesignerService.selectedFormInfo = updatedFormInfo;

        this._copyDataForLocalCache();

        this.loadingService.dismissLoading();

        this.toastService.presentToast('Form categories updated');
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
    this.formDesignerService.clearSelectedTab();
  }

  public onAddCategoryClick() {
    /**
     * We use [unshift] to put the new category at the front of the array so the user can see it sooner
     * without having to scroll or whatever.
     */
    this.categories.unshift(new JT_FormsModel.BasicFormCategoryInfo(this.formDesignerService.selectedFormInfo.FormID));
    // Recall [_onCategoryDataSetChange] to fix calculated data.
    this._onCategoryDataSetChange();
  }

  /**
   * [onCategoryReorder] handles the end event of the <ion-reorder-group>
   * Finish the reorder and position the item in the DOM based on
   * where the gesture ended. Update the items variable to the
   * new order of items.
   */
  public onCategoryReorder(ev: any) {
    this.categories = ev.detail.complete(this.categories);
    this._updateCategorySortOrderUsingIndex();
  }

  public onRemoveCategoryClick(categoryInfo: JT_FormsModel.BasicFormCategoryInfo) {
    categoryInfo.IsDeleted = true;
    /**
     * Use the object's PK to detemine if it's an existing DB record or not.
     * If it's a new record that hasn't been submitted to the DB yet we'll delete it from
     * the source array entirely.
     */
    if (categoryInfo.CategoryID <= 0) {
      var objectIndex = this.categories.indexOf(categoryInfo);
      if (objectIndex !== -1) {
        // [Splice] 1 item at the [objectIndex] position.
        this.categories.splice(objectIndex, 1);
        
      }
    }

    // Recall [_onCategoryDataSetChange] to fix calculated data.
    this._onCategoryDataSetChange();
  }

  public onRestoreCategoryClick(categoryInfo: JT_FormsModel.BasicFormCategoryInfo) {
    categoryInfo.IsDeleted = false;

    // Recall [_onCategoryDataSetChange] to fix calculated data.
    this._onCategoryDataSetChange();
  }

  public onEditCategoryFieldsClick(categoryInfo: JT_FormsModel.BasicFormCategoryInfo) {
    var route = '/jobtraining'
      + '/programdetail/' + this.formDesignerService.selectedFormInfo.ProgramID
      + '/forms/' + this.formDesignerService.selectedFormInfo.FormID
      + '/category/' + categoryInfo.CategoryID
      + '/fields';
    this.navController.navigateRoot(route);
  }

  /*******************************************
  * PRIVATE METHODS
  *******************************************/

  private _onCategoryDataSetChange(){
    this._updateCategorySortOrderUsingIndex();
    this._setWarningMessages();
  }

  private _updateCategorySortOrderUsingIndex() {
    //Loop all [categories] and update the [SortOrder] property.
    this.categories.forEach((loopedCategory, index) => {
      loopedCategory.SortOrder = (index + 1); // + 1 for normal user friendly 1-based SortOrder values.      
    });
  }


  private _setWarningMessages() {
    this.warnings = [];
    // Case 1: Check if there are any records at all.
    const hasCategories = ((this.categories.length > 0));
    if (!hasCategories) {
      this.warnings.push(new JobTrainingModel.WarningMessage('No categories to have been added yet.', 'white'));
    }

    // Case 2: Check if there are any ACTIVE records.
    if (hasCategories) {
      let hasActiveCategories = false;
      this.categories.forEach(loopedCategory => {
        if (!loopedCategory.IsDeleted) {
          // There's at least one active record.
          hasActiveCategories = true;
        }
      });
      if (!hasActiveCategories) {
        this.warnings.push(new JobTrainingModel.WarningMessage('There are no active categories.', 'bootstrap-bg-warning'));
      }
    }
  }


  private _copyDataForLocalCache() {
    /**
     * Make a copy of needed [formDesignerService.selectedFormInfo] data so this view can freely edit it
     * without overwriting the source object.
     */
    this.categories = this.jsonCloneService.cloneObject(this.formDesignerService.selectedFormInfo.Categories);

    this._setWarningMessages();
  }

  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this._copyDataForLocalCache();

    // Calling [setSelectedTabName] helps keep the selected tab/button activated if user refreshes page.
    this.formDesignerService.setSelectedTabName('categories');
  }

}