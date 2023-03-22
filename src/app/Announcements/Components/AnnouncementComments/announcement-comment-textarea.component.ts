import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import * as AnnouncementModel from '../../Providers/announcements.model';
import { isNullOrUndefined } from 'is-what';
import { AlertController, IonTextarea } from '@ionic/angular';

// define component
@Component({
    selector: 'announcement-comment-textarea',
    templateUrl: 'announcement-comment-textarea.component.html',
    styleUrls: ['../../announcements.page.scss']
})

/** This component is for the Status cell of a row */
export class AnnouncementCommentTextareaComponent implements OnInit {
    @ViewChild('commentTextarea', { read: IonTextarea }) commentTextareaElement: IonTextarea;

    @Input() comment: AnnouncementModel.AnnouncementCommentInfo;

    @Input() autofocusTextarea: boolean;

    @Input() showCancelButton: boolean;

    @Output() submitCallback: EventEmitter<any> = new EventEmitter();

    @Output() cancelCallback: EventEmitter<any> = new EventEmitter();

    // define service provider and route provider when component is constructed
    constructor(
        private alertController: AlertController
    ) {
    }

    /*******************************************
     * PUBLIC VARIABLES
     *******************************************/
    public ANNOUNCEMENT_COMMENT_MAX_CHARS = AnnouncementModel.ANNOUNCEMENT_COMMENT_MAX_CHARS;

    public commentTextareaModel: string;

    /**
     * [remainingCharactersMessage] is set on init & and as the textarea input changes.
     * Holds a message like:
     * - 1000 characters remaining
     * or
     * - 1 character remaining
     */
    public remainingCharactersMessage: string;

    /*******************************************
     * PUBLIC METHODS
     *******************************************/
    public onAnnouncementCommentTextareaChange() {
        this._recountAnnouncementCommentCharacterLimit();
    }

    public onSubmitAnnouncementCommentClick() {
        if (!isNullOrUndefined(this.commentTextareaModel) && this.commentTextareaModel !== '') {
            // Put [commentTextareaModel] back on the comment and return it.
            this.comment.Comment = this.commentTextareaModel;

            // Clear out [commentTextareaModel] to prepare for the next add/edit.
            this.commentTextareaModel = '';

            this.submitCallback.emit(this.comment);
        } else {
            // User didn't enter any input yet, alert them
            this.alertController.create({
                message: 'Enter text to submit a comment.',
                buttons: [{ text: 'OK', role: 'ok' }]
            }).then(alertElement => {
                alertElement.present();
            });
        }
    }

    public onCancelAnnouncementCommentClick() {
        this.cancelCallback.emit(this.comment);
    }

    /*******************************************
     * PRIVATE METHODS
     *******************************************/

    private _recountAnnouncementCommentCharacterLimit() {
        const nRemainingCharacters = (AnnouncementModel.ANNOUNCEMENT_COMMENT_MAX_CHARS - this.commentTextareaModel.length);
        this.remainingCharactersMessage = nRemainingCharacters + ' characters remaining';
        if (nRemainingCharacters === 1) {
            // If there is only 1 available char left show 'characters' as a singular noun.
            this.remainingCharactersMessage = nRemainingCharacters + ' character remaining';
        }
    }

    /*******************************************
    * SELF INIT
    *******************************************/
    ngOnInit() {
        /**
         * Using [commentTextareaModel] variables to break [comment.Comment] string from the ngModel
         * so that we don't keep changes when the user chooses to cancel the edit.
         */
        this.commentTextareaModel = this.comment.Comment;
        this._recountAnnouncementCommentCharacterLimit();

        if (this.autofocusTextarea) {
            setTimeout(() => {
                this.commentTextareaElement.setFocus();
            }, 0);
        }
    }

}
