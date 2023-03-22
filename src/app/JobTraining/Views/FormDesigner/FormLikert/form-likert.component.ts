import { Component, OnInit } from '@angular/core';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { JobTrainingProvider } from '../../../Providers/Service';
import { isNullOrUndefined } from 'is-what';
import * as JobTrainingModel from '../../../Providers/Model';
import * as JT_FormsModel from '../../../Providers/Forms.Model';
import { JSONCloneService } from 'src/app/shared/Utilities/json-clone.service';
import { FormDesignerService } from '../form-designer.service';
import { ToastService } from 'src/app/shared/Toast.Service';


// define component
@Component({
  selector: 'edit-form-likert',
  templateUrl: 'form-likert.component.html',
  styleUrls: ['../../../page.scss']
})

export class EditFormLikertComponent implements OnInit {
  // define service provider and route provider when component is constructed
  constructor(
    private toastService: ToastService,
    private loadingService: IonicLoadingService,
    private jobTrainingService: JobTrainingProvider,
    private jsonCloneService: JSONCloneService,
    private formDesignerService: FormDesignerService) {
  }

  /*******************************************
  * PUBLIC VARIABLES
  *******************************************/

  // [likertInfo] - Local copy from the selected form's data. Detached from shared service on _init.
  public likertInfo: JT_FormsModel.FormLikertInfo;

  /**
   * [ratingsWarnings] - Used to show any relevant warning messages in the GUI,
   * like "No data", "Invalid data", etc.
   */
  public ratingsWarnings: JobTrainingModel.WarningMessage[];

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

  /*******************************************
  * PUBLIC METHODS
  *******************************************/

  public onDisableLikertClick() {
    this.likertInfo.IsDeleted = true;
  }

  public onEnableLikertClick() {
    this.likertInfo.IsDeleted = false;
  }

  public onAddRatingClick() {
    /**
     * We use [unshift] to put the new rating at the front of the array so the user can see it sooner
     * without having to scroll or whatever.
     */
    var newRatingInfo = new JT_FormsModel.FormLikertRatingInfo(this.likertInfo.LikertID);
    this.likertInfo.Ratings.unshift(newRatingInfo);
    // Recall [_onRatingsDatasetChanged] to fix calculated data.
    this._onRatingsDatasetChanged();

    // "Auto-focus" this newly added rating.
    this._expandRatingInGUI(newRatingInfo);
  }

  /**
   * [onRatingClick] handles click event for the rating row.
   */
  public onRatingClick(ratingInfo: JT_FormsModel.FormLikertRatingInfo) {
    this._expandRatingInGUI(ratingInfo);
  }

  public onRemoveRatingClick(ratingInfo: JT_FormsModel.FormLikertRatingInfo) {
    ratingInfo.IsDeleted = true;
    /**
     * Use the [RatingID] to detemine if the rating is an existing DB record or not.
     * If it's a new rating that hasn't been submitted to the DB yet we'll delete it from
     * the [Ratings] array entirely.
     */
    if (ratingInfo.RatingID <= 0) {
      var ratingIndex = this.likertInfo.Ratings.indexOf(ratingInfo);
      if (ratingIndex !== -1) {
        // [Splice] 1 item at the [ratingIndex] position.
        this.likertInfo.Ratings.splice(ratingIndex, 1);        
      }
    }

    // Recall [_onRatingsDatasetChanged] to fix calculated data.
    this._onRatingsDatasetChanged();
  }

  public onRestoreRatingClick(ratingInfo: JT_FormsModel.FormLikertRatingInfo) {
    ratingInfo.IsDeleted = false;

    // Recall [_onRatingsDatasetChanged] to fix calculated data.
    this._onRatingsDatasetChanged();
  }

  /**
   * [onRatingReorder] handles the end event of the <ion-reorder-group>
   * Finish the reorder and position the item in the DOM based on
   * where the gesture ended. Update the items variable to the
   * new order of items.
   */
  public onRatingReorder(ev: any) {
    this.likertInfo.Ratings = ev.detail.complete(this.likertInfo.Ratings);
    this._updateRatingSortOrderUsingIndex();
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
    this.jobTrainingService.updateFormLikert(programID, formID, this.likertInfo).subscribe(
      (updatedLikertInfo: JT_FormsModel.FormLikertInfo) => {
        // Overwrite the likert on the shared [formDesignerService.selectedFormInfo] object.
        this.formDesignerService.selectedFormInfo.Likert = updatedLikertInfo;

        /**
         * We can safely just always reset [HasLikert] using [updatedLikertInfo] now.
         * This will help cover cases like:
         * - where the user added a new likert to the form for the first time.
         * - user flagged an existing likert as disabled.
         */
        this.formDesignerService.selectedFormInfo.HasLikert = (!updatedLikertInfo.IsDeleted);

        // Reclone the likert for use in this tool.
        this._copyDataForLocalCache();

        this.loadingService.dismissLoading();

        this.toastService.presentToast('Form likert updated');
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

  /*******************************************
  * PRIVATE METHODS
  *******************************************/

  /**
   * [_expandRatingInGUI] is called when a rating is clicked/focused
   * or added. Shows some additional configuration options while
   * the rating is focused. 
   * 
   * This keeps the likert editor slim by not showing all options at all
   * times. 
   */
  private _expandRatingInGUI(ratingInfo: JT_FormsModel.FormLikertRatingInfo) {
    // Loop other ratings and 'collapse' them.
    this.likertInfo.Ratings.forEach(loopedRating => {
      if (loopedRating.RatingID !== ratingInfo.RatingID) {
        loopedRating['IsFocused'] = false;
      }
    });
    // Expand THIS rating, in case it wasn't already.
    ratingInfo['IsFocused'] = true;
  }

  private _onRatingsDatasetChanged() {
    this._updateRatingSortOrderUsingIndex();
    this._setRatingsWarningMessages();
  }

  private _updateRatingSortOrderUsingIndex() {
    //Loop all [likertInfo.Ratings] and update the [SortOrder] property.
    this.likertInfo.Ratings.forEach((loopedRating, ratingIndex) => {
      loopedRating.SortOrder = (ratingIndex + 1); // + 1 for normal user friendly 1-based SortOrder values.      
    });
  }

  private _setRatingsWarningMessages() {
    this.ratingsWarnings = [];
    // Case 1: Check if there are any records at all.
    const hasRatings = ((this.likertInfo.Ratings.length > 0));
    if (!hasRatings) {
      this.ratingsWarnings.push(new JobTrainingModel.WarningMessage('No ratings to have been added yet.', 'white'));
    }

    // Case 2: Check if there are any ACTIVE records.
    if (hasRatings) {
      let hasActiveRatings = false;
      this.likertInfo.Ratings.forEach(loopedRating => {
        if (!loopedRating.IsDeleted) {
          // There's at least one active record.
          hasActiveRatings = true;
        }
      });
      if (!hasActiveRatings) {
        this.ratingsWarnings.push(new JobTrainingModel.WarningMessage('There are no active ratings.', 'bootstrap-bg-warning'));
      }
    }
  }


  private _copyDataForLocalCache() {
    /**
     * The current [selectedFormInfo.Likert] object may be null/undefined if there wasn't
     * one configured for the form yet. We can start a fresh one now for the user.
     */
    if (isNullOrUndefined(this.formDesignerService.selectedFormInfo.Likert)) {
      this.likertInfo = new JT_FormsModel.FormLikertInfo(this.formDesignerService.selectedFormInfo.FormID);
    }
    else {
      /**
       * Make a copy of needed [formDesignerService.selectedFormInfo] data so this view can freely edit it
       * without overwriting the source object.
       */
      this.likertInfo = this.jsonCloneService.cloneObject(this.formDesignerService.selectedFormInfo.Likert);
    }

    this._setRatingsWarningMessages();
  }


  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this._copyDataForLocalCache();

    // Calling [setSelectedTabName] helps keep the selected tab/button activated if user refreshes page.
    this.formDesignerService.setSelectedTabName('likert');
  }
}