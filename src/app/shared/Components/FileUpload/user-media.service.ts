import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import { isNullOrUndefined } from 'is-what';

export class ProcessedMediaCapturePackage {
    file: File;
    url: string;
    blob: Blob;
}

@Injectable()
export class UserMediaService {
    constructor() { }

    /* Frequency in millis for pinging audio devices for available data */
    public audioProcessInterval: number = 1000;
    public videoProcessInterval: number = 1000;

    public recordingStartTime: number;

    /* Flags to help with audio recording logic */
    public audioRecordingFlags: any = {
        isRecording: false,
        stopRecording: false,
        stopped: true
    };

    public videoRecordingFlags: any = {
        isRecording: false,
        stopRecording: false,
        stopped: true
    };

    /**
     * Creates an observable for fetching and processing audio data from devices.
     * Passes the available stream to a processing function.
     * @param fileName 
     */
    public getAudio(fileName: string = 'user-audio.mp3'): Observable<ProcessedMediaCapturePackage> {
        return new Observable<ProcessedMediaCapturePackage>(subscriber => {
            window.navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            }).then(
                // on fufilled
                (stream: MediaStream) => {
                    this._onGetAudioSuccess(stream, subscriber, fileName);
                },
                // on rejected or failed
                (err) => {
                    const formattedError = this._handleGetUserMediaError(err);

                    subscriber.error(formattedError);
                    subscriber.complete();
                }
            );
        });
    }

    public getVideo(fileName: string = 'user-video.mp4'): Observable<ProcessedMediaCapturePackage> {
        return new Observable<ProcessedMediaCapturePackage>(subscriber => {
            window.navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            }).then(
                // on fufilled
                (stream: MediaStream) => {
                    this._onGetVideoSuccess(stream, subscriber, fileName);
                },
                // on rejected or failed
                (err) => {
                    const formattedError = this._handleGetUserMediaError(err);

                    subscriber.error(formattedError);
                    subscriber.complete();
                }
            );
        });
    }

    private _handleGetUserMediaError(err: any): string {
        let formattedError: string = err.name;
        if (err.name == "NotFoundError" || err.name == "DevicesNotFoundError") {
            // required device is missing
            formattedError = 'Required device is missing';
        } else if (err.name == "NotReadableError" || err.name == "TrackStartError") {
            // webcam or mic are already in use
            formattedError = 'Webcam or mic are already in use';
        } else if (err.name == "OverconstrainedError" || err.name == "ConstraintNotSatisfiedError") {
            // constraints can not be satisfied by avb. devices
            formattedError = 'Constraints can not be satisfied by available devices';
        } else if (err.name == "NotAllowedError" || err.name == "PermissionDeniedError") {
            // permission denied in browser
            formattedError = 'Permission denied.';
        } else if (err.name == "TypeError") {
            // empty constraints object
            formattedError = 'Both audio and video are false.';
        } else {
            // other errors
            formattedError = 'An unexpected error occurred: ' + err.Name;
        }
        return formattedError;
    }

    /**
     * Grabs and processes data from an audio stream 
     * and resolves the observable subscription.
     * @param stream 
     * @param subscriber 
     * @param fileName 
     */
    private _onGetAudioSuccess(stream: MediaStream, subscriber: Subscriber<ProcessedMediaCapturePackage>, fileName: string): void {
        const options = { mimeType: 'audio/webm' },
            recordedChunks = [],
            mediaRecorder = new window['MediaRecorder'](stream, options);

        // Listen for available data and process it accordingly.
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }

            // Components can flip these flags to tell us to stop recording.
            // Handle that case here.
            if (this.audioRecordingFlags.stopRecording && !this.audioRecordingFlags.stopped) {
                /**
                 * Stopping the MediaRecorder only stops the recording of the stream.
                 * To fully stop listening for data (and to remove the red REC circle from the browser tab...)
                 * we need to grab all audio tracks in the stream and stop them individually.
                 */
                mediaRecorder.stop();
                stream.getAudioTracks().forEach(track => track.stop());
                this.audioRecordingFlags.stopped = true;
                this.audioRecordingFlags.isRecording = false;
            }
        };

        // Process the collected audio when the MediaRecorder is stopped.
        mediaRecorder.onstop = (event) => {
            if (isNullOrUndefined(fileName)) {
                fileName = `${Date.now()}.wav`;
            }

            const blob = new Blob(recordedChunks),
                url = URL.createObjectURL(blob),
                file = new File([blob], fileName);

            const audioPackage: ProcessedMediaCapturePackage = {
                blob: blob,
                url: url,
                file: file
            };

            // Resolve the subscription with our "package" object.
            subscriber.next(audioPackage);
            subscriber.complete();
        };

        // Start recording, check for new data at the given interval.
        mediaRecorder.start(this.audioProcessInterval);

        this.audioRecordingFlags.isRecording = true;

        this.recordingStartTime = new Date().getTime();
    }

    private _onGetVideoSuccess(stream: MediaStream, subscriber: Subscriber<ProcessedMediaCapturePackage>, fileName: string): void {

        const options = { mimeType: 'video/webm' },
            recordedChunks = [],
            mediaRecorder = new window['MediaRecorder'](stream, options);

        // Listen for available data and process it accordingly.
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }

            // Components can flip these flags to tell us to stop recording.
            // Handle that case here.
            if (this.videoRecordingFlags.stopRecording && !this.videoRecordingFlags.stopped) {
                /**
                 * Stopping the MediaRecorder only stops the recording of the stream.
                 * To fully stop listening for data (and to remove the red REC circle from the browser tab...)
                 * we need to grab all audio tracks in the stream and stop them individually.
                 */
                mediaRecorder.stop();
                stream.getVideoTracks().forEach(track => track.stop());
                this.videoRecordingFlags.stopped = true;
                this.videoRecordingFlags.isRecording = false;
            }
        };

        // Process the collected audio when the MediaRecorder is stopped.
        mediaRecorder.onstop = (event) => {
            if (isNullOrUndefined(fileName)) {
                fileName = `${Date.now()}.wav`;
            }

            const blob = new Blob(recordedChunks),
                url = URL.createObjectURL(blob),
                file = new File([blob], fileName);

            const videoPackage: ProcessedMediaCapturePackage = {
                blob: blob,
                url: url,
                file: file
            };

            // Resolve the subscription with our "package" object.
            subscriber.next(videoPackage);
            subscriber.complete();
        };

        // Start recording, check for new data at the given interval.
        mediaRecorder.start(this.videoProcessInterval);

        this.videoRecordingFlags.isRecording = true;

        this.recordingStartTime = new Date().getTime();
    }
}