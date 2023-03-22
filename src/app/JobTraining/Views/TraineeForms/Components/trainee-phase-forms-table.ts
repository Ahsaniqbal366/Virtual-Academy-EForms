import { Component, OnInit, Input, SimpleChanges, OnDestroy } from '@angular/core';
import * as JobTrainingModel from '../../../Providers/Model';
import { isNullOrUndefined } from 'is-what';
import { TraineeFormsPopoverMenuFactory } from '../PopoverMenu/trainee-forms.popover-menu.component';
import { IonicLoadingService } from 'src/app/shared/Ionic.Loading.Service';
import { JobTrainingProvider } from 'src/app/JobTraining/Providers/Service';
import { TraineeFormsService } from '../trainee-forms.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

// define component
@Component({
    selector: 'trainee-phase-forms-table',
    templateUrl: 'trainee-phase-forms-table.html',
    styleUrls: ['../../../page.scss', '../trainee-forms.scss']
})

/** This component is for the Status cell of a row */
export class TraineePhaseFormsTableComponent implements OnInit, OnDestroy {
    @Input() formFilterMode: string;

    // define service provider and route provider when component is constructed
    constructor(
        private jobTrainingService: JobTrainingProvider,
        private loadingService: IonicLoadingService,
        public traineeFormsService: TraineeFormsService,
        private traineeFormsPopoverMenuFactory: TraineeFormsPopoverMenuFactory,
        private datepipe: DatePipe
    ) {
        /**
          * Listen for [formSaved$] "Observable" events so that we know when to regenerate summaries.
          * -----
          * Parent/child/sibiling communication workflow taken from this link:
          * https://angular.io/guide/component-interaction
          */
        this._formSavedSubscription = traineeFormsService.formSaved$.subscribe(
            savedTraineeFormRecordInfo => {
                this._onFormSaved(savedTraineeFormRecordInfo);
            });

    }

    /*******************************************
     * PUBLIC VARIABLES
     *******************************************/
    public initialized = false;

    // [phases] is basically a cache of our full dataset.
    public phases: JobTrainingModel.TraineePhaseInfo[];

    /**
     * [filteredPhases] is what we'll really show in the GUI. It's filtered
     * by a searchbox, and maybe more?
     */
    public filteredPhases: JobTrainingModel.TraineePhaseInfo[];

    public hasPhasesWithForms: boolean;

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
    /** Click event for the expandable phase row */
    public onPhaseClick(phase: JobTrainingModel.TraineePhaseInfo): void {
        if (phase.GUIData.Expanded) {
            this._collapsePhase(phase);
        } else {
            this._expandPhase(phase);
        }
    }

    /** Click event for the expandable form group row */
    public onFormGroupClick(formGroup: JobTrainingModel.TraineeFormRecordGroup): void {
        formGroup.GUIData.Expanded = !formGroup.GUIData.Expanded;
    }

    /** Check the clicked element of the parent row to determine if the click event of
     *  of the row should be neglected.
     */
    public onFormRowClick(event: Event, traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {

        // grab the full classname list of the target element
        const targetElementClassName = (event.target as Element).className;

        // if the classname "block-parent-event" does not exist, go ahead and proceed with the parent row's event
        if (targetElementClassName.indexOf('block-parent-event') === -1) {
            this._openFormDetailView(traineeFormRecordInfo);
        }
        else{
            event.preventDefault();
        }
    }

    onPopoverMenuButtonClick(event: Event, traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {
        event.stopImmediatePropagation();
        this.traineeFormsPopoverMenuFactory.openPopover(traineeFormRecordInfo).subscribe((action: string) => {
            switch (action) {
                case 'onFormPhaseChanged':
                    this._onFormPhaseUpdated(traineeFormRecordInfo);
                    break;
                case 'onFormDeleted':
                    this._onFormDeleted(traineeFormRecordInfo);
                    break;
            }
        });
    }

    public onFormAddedFromDialog(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {
        /**
         * In order to load the date and other basic form record info, we'll need to go ahead and add
         * this form to the [TraineeFormRecords] on the proper [Phase].
         */
        this.phases.forEach((loopedPhase) => {
            /**
             * Matching [loopedPhase.PhaseID] w/ [result.data.traineeFormRecordInfo.PhaseID]
             * gives us the selected PhaseID, the user's current phase was the default choice.
             * phase.
             */
            if (loopedPhase.PhaseID === traineeFormRecordInfo.PhaseID) {
                this._insertNewRecordToCorrectGroup(traineeFormRecordInfo, loopedPhase);
                this._expandPhase(loopedPhase);
                this._formatPhaseGUIData();
                this._openFormDetailView(traineeFormRecordInfo);

                // Reset filtered data now that it's changed.
                this.setFilteredPhasesAndForms();
            }
        });
    }
    public setFilteredPhasesAndForms() {
        this.traineeFormsService.filterPhasesAndForms(this.phases)
          .subscribe((result) => {
            // Bind our filtered dataset & clear the loading state.
            this.filteredPhases = result;
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

    private _openFormDetailView(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {
        this.traineeFormsService.openInlineFormMode(traineeFormRecordInfo.RecordID);
    }

    /** The change event for the phase dropdown of a form */
    private _onFormPhaseUpdated(traineeFormRecord: JobTrainingModel.TraineeFormRecordInfo) {
        const newPhase = this.phases.find(phase => phase.PhaseID === traineeFormRecord.PhaseID);
        // In order to recalc the phase summaries & trainee form arrays, we'll call [reloadPhaseSummaries].
        // Loading is dismissed in [reloadPhaseSummaries].
        const loadInBackground = false;
        this._reloadPhaseSummaries(traineeFormRecord, loadInBackground);
        // The GUIData for phases will not be reinit, so we're safe to expand now, despite the async call in the line before
        this._expandPhase(newPhase);
    }

    /** Click event for the delete icon on the form row */
    private _onFormDeleted(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {
        /**
         * In order to recalc the phase summaries & trainee form arrays, we'll call [reloadPhaseSummaries].
         * Loading will dismiss in [reloadPhaseSummaries].
         * Pass the affected [formGroup] in, if applicable
         */
        const loadInBackground = false;
        this._reloadPhaseSummaries(traineeFormRecordInfo, loadInBackground);
    }

    /**
     * [_onFormSaved] runs as a form is saved from the form-detail view or something similar.
     * @param traineeFormRecordInfo
     */
    private _onFormSaved(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo) {
        // In order to recalc the phase summaries & trainee form arrays, we'll call [reloadPhaseSummaries].
        const loadInBackground = true;
        this._reloadPhaseSummaries(traineeFormRecordInfo, loadInBackground);
    }

    private _insertNewRecordToCorrectGroup(
        traineeFormRecord: JobTrainingModel.TraineeFormRecordInfo,
        phase: JobTrainingModel.TraineePhaseInfo) {
        // Try all existing [FormGroups], set this flag if the correct one is located
        let existingFormGroupFound = false;
        // See if there is an existing [FormGroup] to place this new record into
        phase.FormGroups.forEach((loopedFormGroup) => {
            var groupedByMode = loopedFormGroup.GroupedBy;
            if (isNullOrUndefined(groupedByMode) || (groupedByMode === '')) {
                groupedByMode = 'None';
            }

            if (loopedFormGroup.GroupedBy !== 'None') {
                // Check the [FormID], all groups are limited to a single [FormID]
                if (loopedFormGroup.FormID === traineeFormRecord.FormID) {
                    /**
                     * We know that a [FormGroup] with this [FormID] exists,
                     * before adding this form to that group, check what the [GroupedBy] is set to.
                     * If [GroupedBy] is set to "Date", we'll need to compare this form's [Date] with this group's
                     * [GroupedFormsDate].
                     */
                    if (loopedFormGroup.GroupedBy === 'Date') {
                        // Since this is a "Date" [GroupedBy], only add this form record to a group with a matching date
                        if (loopedFormGroup.GroupedFormsDate === traineeFormRecord.Date) {
                            loopedFormGroup.TraineeFormRecords.push(traineeFormRecord);
                            loopedFormGroup.GroupIsSingle = false;
                            existingFormGroupFound = true;
                        }
                    } else {
                        // As of 02/19/2020: There's only the two DB [CollapseBy] values: "Date" and "FormID"
                        loopedFormGroup.TraineeFormRecords.push(traineeFormRecord);
                        loopedFormGroup.GroupIsSingle = false;
                        existingFormGroupFound = true;
                    }
                }
            }
        });

        // If no [existingFormGroupFound], create one to use.
        if (!existingFormGroupFound) {
            phase.FormGroups.push({
                FormID: traineeFormRecord.FormID,
                GroupName: traineeFormRecord.BasicFormInfo.Name,
                GroupIsSingle: !traineeFormRecord.BasicFormInfo.Collapsible,
                GroupedBy: traineeFormRecord.BasicFormInfo.CollapseBy,
                GroupedFormsDate: traineeFormRecord.Date,
                TraineeFormRecords: [traineeFormRecord],
                GUIData: new JobTrainingModel.FormGroupGUIData()
            } as JobTrainingModel.TraineeFormRecordGroup);
        }
    }

    /**
     * [_reloadPhaseSummaries] - Gathers the trainee's program so that phase summaries can be updated.
     * [formGroup] may be null, if not, it's the form group that was affected and needs to be expanded
     */
    private _reloadPhaseSummaries(traineeFormRecordInfo: JobTrainingModel.TraineeFormRecordInfo, loadInBackground: boolean) {
        if (!loadInBackground) {
            this.loadingService.presentLoading('Recalculating summaries...');
        }
        this.jobTrainingService.getTraineePhasesAndForms(
            this.traineeFormsService.traineeUserInfo.ProgramID,
            this.traineeFormsService.traineeUserInfo.UserID,
            this.formFilterMode).subscribe(
                (updatedPhases: JobTrainingModel.TraineePhaseInfo[]) => {
                    /**
                     * Nested foreach loop on the returned [updatedProgramUserInfo.Phases] array and our
                     * cached [this.phases] array.
                     *
                     * Update our cached phases' [TraineeFormRecords] & [Summary] data returned from the
                     * service/API call.
                     */
                    updatedPhases.forEach(loopedUpdatedPhase => {
                        this.phases.forEach(loopedCachedPhase => {
                            if (loopedCachedPhase.PhaseID === loopedUpdatedPhase.PhaseID) {
                                /**
                                 * Update the specfics we came to update, then re-init the GUIData in the new FormGroups,
                                 * Since we're replacing the FormGroups with the new API ones that will not contain
                                 * GUIData.
                                 *
                                 * If [formGroupID] is not null, we'll use it to auto-expand the correct form group
                                 */
                                // Update the specfics we came to update, then re-init the GUIData in the new FormGroups
                                loopedCachedPhase.FormGroups = loopedUpdatedPhase.FormGroups;
                                loopedCachedPhase.Summary = loopedUpdatedPhase.Summary;
                                // Reinit GUIData for the FormGroups in this phase
                                this._reformatFormGroupsGUIData(loopedCachedPhase, traineeFormRecordInfo);
                                this._formatPhaseGUIData();                                
                            }
                        });
                    });
                    if (!loadInBackground) {
                        this.loadingService.dismissLoading();
                    }

                    // Reset filtered data now that it's changed.
                    this.setFilteredPhasesAndForms();
                },
                (error) => {
                    console.log('trainingPrograms-error: ', error);
                    this.loadingService.dismissLoading();
                }
            );
    }

    /**
     * Loops all FormGroups in this phase init the relevant [GUIData] object/property.
     */
    private _reformatFormGroupsGUIData(
        phase: JobTrainingModel.TraineePhaseInfo,
        traineeFormRecord: JobTrainingModel.TraineeFormRecordInfo): void {
        phase.FormGroups.forEach((loopedGroup) => {
            loopedGroup.GUIData = new JobTrainingModel.FormGroupGUIData();
            if (loopedGroup.FormID === traineeFormRecord.FormID) {
                // This is the correct FormID, however, if this form [CollapseBy] "Date" we'll need to find the correct Date Group.
                if (loopedGroup.GroupedBy === 'Date') {
                    const formattedGroupDate = this.datepipe.transform(loopedGroup.GroupedFormsDate, 'MM/dd/yyyy');
                    const formattedRecordDate = this.datepipe.transform(traineeFormRecord.Date, 'MM/dd/yyyy');
                    if (formattedGroupDate === formattedRecordDate) {
                        loopedGroup.GUIData.Expanded = true;
                    }
                } else {
                    loopedGroup.GUIData.Expanded = true;
                }
            }
        });
    }

    /**
     * Auto-expands the best phase(s) for the current view.
     */
    private _autoExpandCurrentPhase(): void {
        if (this.formFilterMode === 'dailyforms') {
            // Auto-expand all phases for 'dailyforms' mode.
            this.phases.map(loopedPhase => {
                loopedPhase.GUIData.Expanded = true;
            });
        } else {
            const currentPhaseID = this.traineeFormsService.traineeUserInfo.PhaseID;

            const matchedPhase = this.phases.find(loopedPhase =>
                loopedPhase.PhaseID === currentPhaseID
            );

            if (!isNullOrUndefined(matchedPhase)) {
                this._expandPhase(matchedPhase);
            }
        }
    }

    /**
     * Marks the givne phase as Expanded and collapses the rest.
     */
    private _evalSingleExpandedPhase(phase: JobTrainingModel.TraineePhaseInfo): void {
        // Iterate phases, expanding the relevant one and collapsing the rest.
        this.phases.forEach(loopedPhase => {
            // JDB 8/11/2020 - This previously matched on entire phase object.
            // This failed sometimes. Changed it to look at PhaseID.
            if (loopedPhase.PhaseID == phase.PhaseID) {
                loopedPhase.GUIData.Expanded = true;
            } else {
                loopedPhase.GUIData.Expanded = false;
            }
        });
        
        // Reset filtered data now that it's changed.
        this.setFilteredPhasesAndForms();
    }

    private _expandPhase(phase: JobTrainingModel.TraineePhaseInfo): void {
        // There may be a bit of model lag when expanding if we are hiding completed items.
        // Let the user know we're doin' stuff.
        if (this.traineeFormsService.hideCompletedItems) {
            const duration = null;
            this.loadingService.presentLoading('Working...', duration, () => this._evalSingleExpandedPhase(phase));
        } else {
            this._evalSingleExpandedPhase(phase);
        }
    }

    private _collapsePhase(phase): void {
        phase.GUIData.Expanded = false;
    }

    /**
     * Loops all phases in init the relevant [GUIData] object/property.
     */
    private _formatPhaseGUIData(): void {
        let nPhasesWithForms = 0;
        this.phases.forEach(loopedPhase => {
            if (isNullOrUndefined(loopedPhase.GUIData)) {
                loopedPhase.GUIData = new JobTrainingModel.PhaseGUIData();
            }

            loopedPhase.FormGroups.forEach((loopedGroup) => {
                if (isNullOrUndefined(loopedGroup.GUIData)) {
                    loopedGroup.GUIData = new JobTrainingModel.FormGroupGUIData();
                }
            });

            if (loopedPhase.FormGroups.length > 0) {
                loopedPhase.GUIData.HasForms = true;
                nPhasesWithForms++;
            }

            if (this.formFilterMode === 'dailyforms') {
                loopedPhase.GUIData.IsHidden = !loopedPhase.GUIData.HasForms
            }

        });

        this.hasPhasesWithForms = (nPhasesWithForms > 0);
    }

    private _getTraineePhasesAndForms() {
        this.loadingService.presentLoading('Loading forms...');
        this.jobTrainingService.getTraineePhasesAndForms(
            this.traineeFormsService.traineeUserInfo.ProgramID,
            this.traineeFormsService.traineeUserInfo.UserID,
            this.formFilterMode
        ).subscribe(
            (phases: JobTrainingModel.TraineePhaseInfo[]) => {
                this.phases = phases;

                this._formatPhaseGUIData();

                this._autoExpandCurrentPhase();

                // Reset filtered data now that it's changed.
                this.setFilteredPhasesAndForms();

                this.loadingService.dismissLoading();

                this.initialized = true;
            },
            (error) => {
                console.log('trainingPrograms-error: ', error);
                this.loadingService.dismissLoading();
            }
        );
    }

    /*******************************************
    * SELF INIT
    *******************************************/
    ngOnInit() {
        //this.initialized = false;
        //this._getTraineePhasesAndForms();        
    }

    ngOnDestroy() {
        // prevent memory leak when component destroyed.
        this._formSavedSubscription.unsubscribe();
    }

    // Listen for changes to the @input and reinit if needed.
    ngOnChanges(changes: SimpleChanges) {
        this.initialized = false;
        this._getTraineePhasesAndForms();
    }

}
