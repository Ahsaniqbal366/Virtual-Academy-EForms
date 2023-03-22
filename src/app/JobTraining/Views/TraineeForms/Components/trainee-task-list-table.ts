import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import * as JobTrainingModel from '../../../Providers/Model';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { JobTrainingProvider } from 'src/app/JobTraining/Providers/Service';
import { TraineeFormsService } from '../trainee-forms.service';
import { Subscription } from 'rxjs';

// define component
@Component({
  selector: 'trainee-task-list-table',
  templateUrl: 'trainee-task-list-table.html',
  styleUrls: ['../../../page.scss', '../trainee-forms.scss']
})

/** This component is for the Status cell of a row */
export class TraineeTaskListTableComponent implements OnInit, OnDestroy {
  // define service provider and route provider when component is constructed
  constructor(
    private jobTrainingService: JobTrainingProvider,
    private loadingService: IonicLoadingService,
    public traineeFormsService: TraineeFormsService
  ) {

    /**
     * Listen for [formSaved$] "Observable" events so that we know when to regenerate summaries.
     * -----
     * Parent/child/sibiling communication workflow taken from this link:
     * https://angular.io/guide/component-interaction
     */
    this._formSavedSubscription = traineeFormsService.formSaved$.subscribe(
      savedTraineeFormRecordInfo => {
        this._onTaskFormSaved(savedTraineeFormRecordInfo);
      });

  }


  /*******************************************
   * PUBLIC VARIABLES
   *******************************************/
  public initialized = false;

  // [taskList] is basically a cache of our full dataset.
  public taskList: JobTrainingModel.FullTraineeTaskListInfo;

  /**
   * [filteredTaskListCategories] is what we'll really show in the GUI. It's filtered
   * by a searchbox, and maybe more?
   */
  public filteredTaskListCategories: JobTrainingModel.FullTraineeTaskListCategoryInfo[];

  /*******************************************
   * PRIVATE VARIABLES
   *******************************************/

  /**
   * [_formSavedSubscription] is set in the class [constructor].
   * Variable is used to track an observable subscription.
   */
  private _formSavedSubscription: Subscription;

  /*******************************************
   * PUBLIC METHODS
   *******************************************/
  /** Click event for the expandable card */
  public onCategoryClick(category: JobTrainingModel.FullTraineeTaskListCategoryInfo): void {
    if (category.GUIData.Expanded) {
      this._collapseCategory(category);
    } else {
      this._expandCategory(category);
    }
  }

  /** Check the clicked element of the parent row to determine if the click event of
     *  of the row should be neglected.
     */
  onFormRowClick(event: Event, task: JobTrainingModel.FullTraineeTaskListTaskInfo) {

    // grab the full classname list of the target element
    const targetElementClassName = (event.target as Element).className;

    // if the classname "block-parent-event" does not exist, go ahead and proceed with the parent row's event
    if (targetElementClassName.indexOf('block-parent-event') === -1) {
      if (task.CanHaveForm) {
        if (task.HasTraineeFormRecords) {
          this._openFormDetailView(task);
        }
        else {
          this._startNewFormForTask(task);
        }
      }
    }
  }

  public setFilteredTaskList() {
    const filterRecordsByDate = false; // No need to consider dates on the TaskList as of 5/12/2020.
    this.traineeFormsService.filterTaskList(this.taskList, filterRecordsByDate)
      .subscribe((result) => {
        // Bind our filtered dataset & clear the loading state.
        this.filteredTaskListCategories = result;
        this.traineeFormsService.isSearching = false;

        // We may have presented loading, depending on whether we are currently hiding completed items.
        // If so, dismiss loading.
        if (this.traineeFormsService.hideCompletedItems) {
            this.loadingService.dismissLoading();
        }
      });
  }

  /*******************************************
   * PRIVATE METHODS
   *******************************************/
  private _startNewFormForTask(task: JobTrainingModel.FullTraineeTaskListTaskInfo) {
    this.loadingService.presentLoading('Loading form...');
    let traineeFormRecordToStart = {
      RecordID: null,
      UserID: this.traineeFormsService.traineeUserInfo.UserID,
      ShiftID: this.traineeFormsService.traineeUserInfo.ShiftID,
      PhaseID: this.traineeFormsService.traineeUserInfo.PhaseID,
      TaskID: task.TaskID,
      FormID: task.FormID,
      Date: new Date()
    } as JobTrainingModel.TraineeFormRecordInfo;

    this.jobTrainingService.startTraineeFormRecord(traineeFormRecordToStart).subscribe(
      (outputTraineeFormRecord: JobTrainingModel.TraineeFormRecordInfo) => {
        /**
         * Immediately bind new TraineeFormRecord to the task.
         * This will help prevent duplicate form records from being created for the task & trainee,
         * at least in this session. Similar logic will run in the API to further prevent 
         * the issue.
         */
        task.HasTraineeFormRecords = true;
        task.TraineeFormRecords = [];
        task.TraineeFormRecords.push(outputTraineeFormRecord);

        /**
         * Calling [_reloadTaskSummaries] to keep the tasks summary updated
         * as the form is added/saved. This shouldn't mess up the formDetailView.
         */
        const loadInBackground = true;
        this._reloadTaskSummaries(task, loadInBackground);

        //Don't dismiss the loading state yet. [_openFormDetailView] will handle that for us.
        this._openFormDetailView(task);
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      }
    );
  }

  /**
   * [_onTaskFormSaved] runs as a form is saved from the form-detail view or something similar.
   * @param traineeFormRecordInfo
   */
  private _onTaskFormSaved(savedTraineeFormRecord: JobTrainingModel.TraineeFormRecordInfo) {
    /**
     * Use [savedTraineeFormRecord] to find the related task to keep in sync.
     */
    this.taskList.Categories.forEach(loopedCategory => {
      loopedCategory.Tasks.forEach(loopedTask => {
        if (loopedTask.TaskID === savedTraineeFormRecord.TaskID) {
          /**
           * Calling [_reloadTaskSummaries] to keep the tasks summary updated
           * as the form is added/saved. This shouldn't mess up the formDetailView.
           */
          const loadInBackground = true;
          this._reloadTaskSummaries(loopedTask, loadInBackground);
        }
      });
    });
  }

  private _openFormDetailView(task: JobTrainingModel.FullTraineeTaskListTaskInfo) {
    // We're assuming there is only [TraineeFormRecord] for the given [task].
    var traineeFormRecordID = task.TraineeFormRecords[0].RecordID;
    this.traineeFormsService.openInlineFormMode(traineeFormRecordID);
  }

  private _getTraineeTaskList() {
    this.loadingService.presentLoading('Loading task list...');
    // TODO - Find a better way to get this TaskListID.
    const taskListID = this.jobTrainingService.selectedProgram.PerformanceTaskListID;
    this.jobTrainingService.getTraineeTaskList(
      this.traineeFormsService.traineeUserInfo.ProgramID,
      this.traineeFormsService.traineeUserInfo.UserID,
      taskListID).subscribe(
      (taskList: JobTrainingModel.FullTraineeTaskListInfo) => {
        this.taskList = taskList;
        this._formatTaskListGUIData();

        // Reset filtered data now that it's changed.
        this.setFilteredTaskList();

        this.loadingService.dismissLoading();

        this.initialized = true;
      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        this.loadingService.dismissLoading();
      });
  }

  /**
    * [_reloadTaskSummaries] is called after forms are added/deleted/updated.
    * Updates summary info, AND populates and/or removes and/or sorts form records as needed.
    */
  private _reloadTaskSummaries(task: JobTrainingModel.FullTraineeTaskListTaskInfo, loadInBackground: boolean) {
    /**
     * Use [task] to also cache the task's parent "category" object.
     * When the task summary is updated that data will feed up to the parent cateogyr.
     */
    let taskCategory: JobTrainingModel.FullTraineeTaskListCategoryInfo;
    this.taskList.Categories.forEach(loopedCategory => {
      if (task.TaskCategoryID == loopedCategory.TaskCategoryID) {
        taskCategory = loopedCategory;
      }
    });

    if (loadInBackground) {
      this.loadingService.presentLoading('Recalculating summaries...');
    }
    this.jobTrainingService.getTraineeTaskList(
      this.traineeFormsService.traineeUserInfo.ProgramID,
      this.traineeFormsService.traineeUserInfo.UserID,
      task.TaskListID).subscribe(
      (updatedTaskList: JobTrainingModel.FullTraineeTaskListInfo) => {
        // Nested foreach loop on the returned [updatedTaskList.Categories] & [category.Tasks] arrays.
        updatedTaskList.Categories.forEach(updatedCategory => {

          // Update the given [taskCategory] data returned from the service/API call.
          if (taskCategory.TaskCategoryID == updatedCategory.TaskCategoryID) {
            taskCategory.Summary = updatedCategory.Summary;
          }

          updatedCategory.Tasks.forEach(updatedTask => {
            // Update the given [task] data returned from the service/API call.
            if (task.TaskID === updatedTask.TaskID) {
              task.Summary = updatedTask.Summary;
              task.TraineeFormRecords = updatedTask.TraineeFormRecords;
              task.HasTraineeFormRecords = updatedTask.HasTraineeFormRecords;
            }
          });
        });
        if (loadInBackground) {
          this.loadingService.dismissLoading();
        }

        // Reset filtered data now that it's changed.
        this.setFilteredTaskList();

      },
      (error) => {
        console.log('trainingPrograms-error: ', error);
        if (loadInBackground) {
          this.loadingService.dismissLoading();
        }
      }
    );
  }

  /**
   * Marks the given category as Expanded and collapses the rest.
   */
  private _evalSingleExpandedCategory(category: JobTrainingModel.FullTraineeTaskListCategoryInfo): void {
    // Iterate categories, expanding the relevant one and collapsing the rest.
    this.taskList.Categories.forEach(loopedCategory => {
        if (loopedCategory.TaskCategoryID == category.TaskCategoryID) {
            loopedCategory.GUIData.Expanded = true;
        } else {
            loopedCategory.GUIData.Expanded = false;
        }
    });
    
    // Reset filtered data now that it's changed.
    this.setFilteredTaskList();
  }

  private _expandCategory(category: JobTrainingModel.FullTraineeTaskListCategoryInfo): void {
    // There may be a bit of model lag when expanding if we are hiding completed items.
    // Let the user know we're doin' stuff.
    if (this.traineeFormsService.hideCompletedItems) {
        const duration = null;
        this.loadingService.presentLoading('Working...', duration, () => this._evalSingleExpandedCategory(category));
    } else {
        this._evalSingleExpandedCategory(category);
    }
  }


  private _collapseCategory(category: JobTrainingModel.FullTraineeTaskListCategoryInfo): void {
    category.GUIData.Expanded = false;
  }


  private _formatTaskListGUIData() {

    this.taskList.Categories.forEach(loopedCategory => {
      loopedCategory.GUIData = new JobTrainingModel.TaskListCategoryGUIData();
    });
  }

  /*******************************************
  * SELF INIT
  *******************************************/
  ngOnInit() {
    this._getTraineeTaskList();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed.
    this._formSavedSubscription.unsubscribe();
  }

}
