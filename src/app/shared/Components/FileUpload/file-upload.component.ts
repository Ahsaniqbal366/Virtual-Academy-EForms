import { Component, OnInit, ElementRef, Injectable, ChangeDetectorRef, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { Subscription, Subject, interval, Observable } from 'rxjs';
import { isNullOrUndefined } from 'is-what';
import { UserMediaService } from './user-media.service';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { FileUploadInputConfig, FileUploadService } from './file-upload.service';
import { MaterialLoadingService } from '../../Material.Loading.Service';
import { AlertDialogComponent, AlertDialogFactory } from '../../Utilities/AlertDialog/alert-dialog';

@Component({
    selector: 'sls-file-upload-component',
    templateUrl: './file-upload.component.html',
    styleUrls: [],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FileUploadComponent implements OnInit {
    constructor(
        public userMediaService: UserMediaService,
        public componentRef: ElementRef,
        private changeDetector: ChangeDetectorRef,
        private platform: Platform,
        private _alertDialogFactory: AlertDialogFactory,
        private _fileUploadService: FileUploadService,
        private _loadingService: MaterialLoadingService
    ) { }

    /*******************************************
     * PUBLIC VARIABLES
     *******************************************/
    @Input() inputData: FileUploadComponentInput;
    @Input() disabled: boolean;

    @Output() output_onFileUploaded: EventEmitter<string> = new EventEmitter();

    public initialized = false;

    public get isRecording(): boolean {
        const audioRecording = this.userMediaService.audioRecordingFlags.isRecording;
        const videoRecording = this.userMediaService.videoRecordingFlags.isRecording;
        const finalResult = audioRecording || videoRecording;
        return finalResult;
    }

    /**
     * "showTab" style variables below are set on init. Based on input data not all tabs
     * will be available in the GUI.
     */
    public showGeneralFileTab: boolean;
    public showAudioFileTab: boolean;
    public showVideoFileTab: boolean;
    public showTabs: boolean;
    // [selectedTab] might get reset on init based on input data.
    public selectedTab = 'File';

    public isUploading: boolean;
    public saveDisabled: boolean;
    public hasError: boolean;
    public apiResonseError: any;
    public isUploaded: boolean;
    public isRecorded: boolean;

    public fileToUpload: any;
    public uploadedFile: any;

    @Output() removeButtonClickEvent: EventEmitter<number> = new EventEmitter<number>();

    /*******************************************
     * PRIVATE VARIABLES
     *******************************************/


    private _processedAudioPackage: any = {
        file: undefined,
        url: undefined,
        blob: undefined
    };

    private _processedVideoPackage: any = {
        file: undefined,
        url: undefined,
        blob: undefined
    };

    private _audio$: Subscription;
    private _video$: Subscription;
    private _timer$ = new Subject();

    /*******************************************
    * PUBLIC METHODS
    *******************************************/
    public onRemoveButtonClick() {
        this.isUploaded = false;
        delete this.uploadedFile;
        delete this.fileToUpload;

        this.removeButtonClickEvent.emit();
    }

    public onTabSegmentChanged(event: any): void {
        if (event.detail.value) {
            this.selectedTab = event.detail.value;
        }
    }

    public fileUploadChangeListener($event): void {
        if ($event.target.files.length > 0) {
            if (this._validateFileUploaded($event.target.files[0])) {
                this.fileToUpload = $event.target.files[0];
                // This will get the uploaded URL added to it, unlike [filetoupload]
                this.uploadedFile = $event.target.files[0];

                this.saveDisabled = false;

                // determine if the uploader will be using the default behavior of
                // allowing the parent component to submit the file or if it will automatically
                // upload the file and return the cloud path string
                if (this.inputData.FileUploadConfig.autoSubmit) {
                    this._loadingService.presentLoading('Uploading file...');

                    // upload the file
                    this.uploadFile().subscribe((uploadedFileURL: string) => {

                        // [uploadedFile] is sent into the file-uploaded 
                        this.uploadedFile.filePath = uploadedFileURL;
                        // emit the uploaded file's cloud path back to the parent component
                        this.output_onFileUploaded.emit(uploadedFileURL);

                        this.isUploaded = true;

                        this._loadingService.dismissLoading();
                    },
                        // upload fail
                        (error) => {
                            console.error('trainingPrograms-error: ', error);
                            this._loadingService.dismissLoading();

                        }
                    );
                }
            }
        }
        else {
            this.fileToUpload = null;
            this.saveDisabled = true;
        }
    }

    public startRecording(): void {
        this.isRecorded = false;
        const that = this;
        // We need to wait for the actual recording to start before counting
        if (this.platform.is('desktop')) {
            if (this.selectedTab === 'Video') {
                // Check the type of media to gather
                const permissionName = "camera" as PermissionName;
                navigator.permissions.query({ name: permissionName }).then(function (result) {
                    if (result.state === 'granted') {
                        that._recordVideo();
                    } else {
                        that._alertDialogFactory.openDialog({
                            header: 'Camera Permission Required',
                            message: 'Please enable Camera Permission to continue.',
                            buttonText: 'OK',
                            // [disableClose] - Let user click outside to close.
                            disableClose: false
                        });
                    }
                });
            } else if (this.selectedTab === 'Audio') {
                // Check the type of media to gather
                const permissionName = "microphone" as PermissionName;
                navigator.permissions.query({ name: permissionName }).then(function (result) {
                    if (result.state === 'granted') {
                        that._recordAudio();
                    } else {
                        that._alertDialogFactory.openDialog({
                            header: 'Microphone Permission Required',
                            message: 'Please enable Microphone Permission to continue.',
                            buttonText: 'OK',
                            // [disableClose] - Let user click outside to close.
                            disableClose: false
                        });
                    }
                });
            }
        } else if (this.platform.is('android')) {
            this._recordAudio();
        }
    }

    private _recordAudio() {
        this.isRecorded = false;

        this._resetAudio();

        this._audio$ = this.userMediaService.getAudio().subscribe(
            (audioPackage) => {
                this._processedAudioPackage = audioPackage;

                // Setting this dynamically using data-binding in the template does not work.
                const audio = this.componentRef.nativeElement.querySelector('audio');
                audio.src = this._processedAudioPackage.url;
                audio.load();
                audio.hidden = false;
                this.isRecorded = true;
                // const saveBtn = this.componentRef.nativeElement.querySelector('.save-btn');
                // saveBtn.hidden = false;

            },
            // get media failed
            (errorMessage: string) => {
                this._alertDialogFactory.openDialog({
                    header: errorMessage,
                    message: errorMessage,
                    buttonText: 'OK',
                    // [disableClose] - Let user click outside to close.
                    disableClose: false
                });
            }
        );
    }
    private _recordVideo() {
        this.isRecorded = false;

        this._resetVideo();

        this._video$ = this.userMediaService.getVideo().subscribe(
            (videoPackage) => {
                this._processedVideoPackage = videoPackage;

                // Setting this dynamically using data-binding in the template does not work.
                this.isRecorded = true;
                const video = this.componentRef.nativeElement.querySelector('video');

                video.src = this._processedVideoPackage.url;
                video.load();

                // const saveBtn = this.componentRef.nativeElement.querySelector('.save-btn');
                // saveBtn.hidden = false;

            },
            // get media failed
            (errorMessage: string) => {
                this._alertDialogFactory.openDialog({
                    header: errorMessage,
                    message: errorMessage,
                    buttonText: 'OK',
                    // [disableClose] - Let user click outside to close.
                    disableClose: false
                  });
            });
    }

    public stopRecording(): void {
        if (!this.userMediaService.audioRecordingFlags.stopped) {
            this.userMediaService.audioRecordingFlags.stopRecording = true;
        }
        if (!this.userMediaService.videoRecordingFlags.stopped) {
            this.userMediaService.videoRecordingFlags.stopRecording = true;
        }
    }

    public getRecordingElapsedTime(): string {
        let totalSeconds = Math.floor((new Date().getTime() - this.userMediaService.recordingStartTime) / 1000);
        let minutes: any = 0,
            seconds: any = 0;

        if (totalSeconds >= 60) {
            minutes = Math.floor(totalSeconds / 60);
            totalSeconds -= 60 * minutes;
        }

        seconds = totalSeconds;

        if (minutes < 10) {
            minutes = `0${minutes}`;
        }

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        return `${minutes}:${seconds}`;
    }

    public hasFileToUpload(): boolean {
        let hasFile = false;
        switch (this.selectedTab) {
            case 'File':
                hasFile = !isNullOrUndefined(this.fileToUpload);
                break;
            case 'Audio':
                hasFile = !isNullOrUndefined(this._processedAudioPackage.file) || !isNullOrUndefined(this.fileToUpload);
                break;
            case 'Video':
                hasFile = !isNullOrUndefined(this._processedVideoPackage.file) || !isNullOrUndefined(this.fileToUpload);
                break;
        }
        return hasFile;
    }

    public uploadFile(): Observable<string> {
        let file: File;
        switch (this.selectedTab) {
            case 'File':
                file = this.fileToUpload;
                break;
            case 'Audio':
                if (!isNullOrUndefined(this._processedAudioPackage.file)) {
                    file = this._processedAudioPackage.file;
                }
                else if (!isNullOrUndefined(this.fileToUpload)) {
                    file = this.fileToUpload;
                }
                break;
            case 'Video':
                if (!isNullOrUndefined(this._processedVideoPackage.file)) {
                    file = this._processedVideoPackage.file;
                }
                else if (!isNullOrUndefined(this.fileToUpload)) {
                    file = this.fileToUpload;
                }
                break;
        }

        return new Observable<string>(subscriber => {
            this._fileUploadService.saveFileToCloud(file, this.inputData.FileUploadConfig).subscribe(
                // Success
                (uploadedFilePath: any) => {
                    subscriber.next(uploadedFilePath);
                    subscriber.complete();
                },
                // Fail
                (error: string) => {
                    // [saveFileToCloud] method will handle any needed alerts to show the user.                
                    subscriber.error(error);
                    subscriber.complete();
                }
            );
        });

    }

    public get getFileUploadRequirementsString(): string {
        return ('*Only ' + this.inputData.FileUploadConfig.validFileTypes.join(', ') + ' file types are supported. '
            + 'File size must be under ' + this.inputData.FileUploadConfig.maxFileSize_MB + 'MB.');
    }

    /*******************************************
    * PRIVATE METHODS
    *******************************************/
    private _validateFileUploaded(fileToValidate): boolean {
        var isValid = true;
        var validationMessage = '';
console.log(fileToValidate.type);
        if (!this.inputData.FileUploadConfig.validFileTypes.find(ft => fileToValidate.type.split('/').find(t => t == ft))) {
            isValid = false;
            validationMessage = 'The selected file type is not allowed. ';
        } else if (fileToValidate.size / 1024 / 1024 > this.inputData.FileUploadConfig.maxFileSize_MB) {
            isValid = false;
            validationMessage = 'The selected file type is too large. ';
        }

        validationMessage += this.getFileUploadRequirementsString;
        if (!isValid) {
            this._alertDialogFactory.openDialog({
                header: '',
                message: validationMessage,
                buttonText: 'OK',
                // [disableClose] - Let user click outside to close.
                disableClose: false
            });
        }

        return isValid;
    }

    private _resetAudio(): void {
        this.userMediaService.audioRecordingFlags.isRecording = false;
        this.userMediaService.audioRecordingFlags.stopRecording = false;
        this.userMediaService.audioRecordingFlags.stopped = false;

        this._processedAudioPackage.file = undefined;
        this._processedAudioPackage.url = undefined;
        this._processedAudioPackage.blob = undefined;

        this.userMediaService.recordingStartTime = 0;

        const audio = this.componentRef.nativeElement.querySelector('audio');
        audio.hidden = true;

        // const saveBtn = this.componentRef.nativeElement.querySelector('.save-btn');
        // saveBtn.hidden = true;
    }

    private _resetVideo(): void {
        this.userMediaService.videoRecordingFlags.isRecording = false;
        this.userMediaService.videoRecordingFlags.stopRecording = false;
        this.userMediaService.videoRecordingFlags.stopped = false;

        this._processedVideoPackage.file = undefined;
        this._processedVideoPackage.url = undefined;
        this._processedVideoPackage.blob = undefined;

        this.userMediaService.recordingStartTime = 0;

        const video = this.componentRef.nativeElement.querySelector('video');
        video.hidden = true;

        // const saveBtn = this.componentRef.nativeElement.querySelector('.save-btn');
        // saveBtn.hidden = true;
    }

    /*******************************************
     * SELF INIT
     *******************************************/

    ngOnInit() {
        interval(1000).subscribe(() => {
            if (!this.changeDetector['destroyed']) {
                this.changeDetector.detectChanges();
            }
        });
        this.changeDetector.detectChanges();

        this.selectedTab = this.inputData.SelectedTab;

        // If [inputData.AvailableTabs] is empty, null, w/e then we'll say all tabs are available.
        if (isNullOrUndefined(this.inputData.AvailableTabs) || this.inputData.AvailableTabs.length === 0) {
            this.showGeneralFileTab = true;
            this.showAudioFileTab = true;
            this.showVideoFileTab = true;
            this.showTabs = true;
        }
        else {
            this.showGeneralFileTab = (this.inputData.AvailableTabs.indexOf("File") !== -1);
            this.showAudioFileTab = (this.inputData.AvailableTabs.indexOf("Audio") !== -1);
            this.showVideoFileTab = (this.inputData.AvailableTabs.indexOf("Video") !== -1);
            this.showTabs = this.inputData.AvailableTabs.length > 1;
        }

        // If there is a [preExistingFileUpload] upload, just use it
        if (this.inputData.preExistingFileUpload) {
            this.isUploaded = true;
            this.uploadedFile = {
                filePath: this.inputData.preExistingFileUpload,
                name: this.inputData.preExistingFileUpload.split('/').pop()
            }
        }

        this.initialized = true;
    }

    ngOnDestroy() {
        if (this._audio$) {
            this._audio$.unsubscribe();
        }
        if (this._video$) {
            this._video$.unsubscribe();
        }
        if (this._timer$) {
            this._timer$.next();
            this._timer$.complete();
        }
    }

}

export class FileUploadComponentInput {
    public SelectedTab: string;
    public AvailableTabs: string[] = [];
    public FileUploadConfig: FileUploadInputConfig;
    public showInstructions: boolean;
    public useCustomTitle: boolean;
    public showFileUploadedCard: boolean;
    public customTitleText: string;
    public preExistingFileUpload: string;
}