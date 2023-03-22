import { Component, OnInit } from '@angular/core';
import { IonicLoadingService } from '../../../../shared/Ionic.Loading.Service';
import { JobTrainingProvider } from '../../../Providers/Service';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FullFormInfo } from '../../../Providers/Forms.Model';
import { JSONCloneService } from 'src/app/shared/Utilities/json-clone.service';
import { FormDesignerService } from '../form-designer.service';
import { ToastService } from '../../../../shared/Toast.Service';

// define component
@Component({
  selector: 'edit-form-settings',
  templateUrl: 'form-settings.component.html',
  styleUrls: ['../../../page.scss']
})

export class EditFormSettingsComponent implements OnInit {


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

  // [formInfo] - Local copy from the selected form's data. Detached from shared service on _init.
  public formInfo: FullFormInfo;

  public ckeditorInstance = ClassicEditor;
  public ckeditorConfig = {
    placeholder: 'Add content here...',
    toolbar:
      [
        'bold', 'italic',
        '|',
        'link'
      ]
  };

  /*******************************************
  * PRIVATE VARIABLES
  *******************************************/

  /*******************************************
  * PUBLIC METHODS
  *******************************************/

  // [onIncludeInPhaseFormsChange] handles change event for the relevant checkbox in the GUI.
  public onIncludeInPhaseFormsChange() {
    /**
     * If user is checking this box, also force [IncludeDateField] to true.
     * The same logic is applied in the API when saving a form.
     */
    if (this.formInfo.IncludeInPhaseForms) {
      this.formInfo.IncludeDateField = true;
    }
  }

  /** 
   * [onSubmitClick] - The click event for the submit button. 
   * Validates data, sends to API.
   */
  public onSubmitClick() {
    this.loadingService.presentLoading('Saving changes...');
    // 1. [if valid] Send to service
    // 1.1 Maybe validation error from serverside - will get alerted to user.
    // 1.2. Submission success - reset cached data for all views on service.

    this.jobTrainingService.updateForm(this.formInfo).subscribe(
      (updatedFormInfo: FullFormInfo) => {      
        // Overwrite [formDesignerService.selectedFormInfo] w/ the newly updated data.
        this.formDesignerService.selectedFormInfo = updatedFormInfo;

        this._copyDataForLocalCache();

        this.loadingService.dismissLoading();

        this.toastService.presentToast('Form settings updated');
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

  private _copyDataForLocalCache() {
    /**
     * Make a copy of needed [formDesignerService.selectedFormInfo] data so this view can freely edit it
     * without overwriting the source object.
     */
    this.formInfo = this.jsonCloneService.cloneObject(this.formDesignerService.selectedFormInfo);
  }

  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this._copyDataForLocalCache();
    
    // Calling [setSelectedTabName] helps keep the selected tab/button activated if user refreshes page.
    this.formDesignerService.setSelectedTabName('settings');
  }

}