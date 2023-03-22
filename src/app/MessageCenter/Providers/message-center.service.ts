import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../shared/API.Base.Service';

import * as MessageCenterModel from '../Providers/message-center.model';
import { API_URLS } from 'src/environments/environment';
import { ToastService } from 'src/app/shared/Toast.Service';
import { AlertController, NavController, AngularDelegate } from '@ionic/angular';
import { MessageInfo, MessageCenterTab, MessageToBeSent, MessageToBeSentGUIData } from '../Providers/message-center.model';
import { timeout } from 'rxjs/operators';

const _coreAPIRoot = API_URLS.Core;

@Injectable()
export class MessageCenterProvider {

    // initialize the service provider, which will retain all data unless the user refreshes.
    constructor(
        private apiBaseService: APIBaseService,
        public toastService: ToastService,
        public alertController: AlertController,
        public navController: NavController) { }

    // Holds data specific to this user's session, holds any permission flags to drive GUI elements
    public serverInfo: MessageCenterModel.MessageCenterServerInfo;

    // Holds data to compose a new message as a reply to an existing message.
    public replyInfo = {
        isReplying: false,
        replySubject: '',
        replyBody: '',
        replyReceipt: '',
        replyUser: {
            RankID: 0,
            FullName: '',
            UserID: 0,
            Username: '',
            ProfilePicture: ''
        }
    };

    // Set on the Compose tab _init to be appended to the message body
    public signatureInfo: any;

    // Displays progress bar and disables most actions
    public isLoading: boolean;

    // Main message lists for each tab
    public activeMessages = [];
    public sentMessages = [];
    public deletedMessages = [];
    public archivedMessages = [];

    // [cachedMessages] to change when swapping between tabs and passed to the filter
    public cachedMessages = [];
    // The [filteredAndSortedMessages] is to use for moving between messages in the Message View while ignoring
    // The infinite scroll slicing but following filter and sorting
    public filteredAndSortedMessages = [];
    // The [renderedMessages] is after the infinite-scroll adjusts the [numberToRender] to only display this
    // many on screen at.
    public renderedMessages = [];

    public userInfo: any;
    public unreadCounts: any;
    public rolesForMessage: any;

    public subView: string;
    public isMessageOpened: boolean;
    public messageID: number;
    public headerText: string;

    // Master Action variables
    public masterActions = {
        selectedAction: '',
        selectDisabled: false,
        // Number of selected messages
        numberOfSelected: 0,
        // Flag for select all checkbox
        someSelected: false
    };

    // The message to be sent object
    public messageToBeSent = {
        Recipients: [],
        Section: 0,
        Districts: [],
        Groups: [],
        Subject: '',
        Attachments: [],
        Message: '',
        GUIData: {
            recipientType: 'users'
        } as MessageToBeSentGUIData
    } as MessageToBeSent;

    public resetMessageToBeSent() {
        this.messageToBeSent = {
            Recipients: [],
            Section: 0,
            Districts: [],
            Groups: [],
            Subject: '',
            Attachments: [],
            Message: '',
            GUIData: {
                recipientType: this.messageToBeSent.GUIData.recipientType
            } as MessageToBeSentGUIData
        } as MessageToBeSent;
        this.setMessageBody();
    }

    public setMessageBody(){
        
        if(this.signatureInfo === 'null'){
            this.signatureInfo = null;
        }else if (this.replyInfo.isReplying) {
            this.messageToBeSent.Subject =
                'RE: ' + this.replyInfo.replySubject;
            this.messageToBeSent.Recipients =
                [this.replyInfo.replyUser];
            this.messageToBeSent.Message =
                'Type a response here. <br/> <br/> <br/>' +
                this.signatureInfo +
                '<br/><hr/><p><em><br/>' + 'From ' +
                this.replyInfo.replyUser.FullName +
                ' on ' + this.replyInfo.replyReceipt +
                '</em><br/><br/>' + this.replyInfo.replyBody +
                '</p>';
        } else if (this.signatureInfo) {
            this.messageToBeSent.Message =
                'Type a message here. <br/> <br/> <br/>' + this.signatureInfo;
        }
    }

    public onSendButtonClick() {
        this._validateMessageTobeSent().then((resolved) => {
            // Resolved from a valid and ready to send message, send Message, flag loading
            this.isLoading = true;
            // Depending on the [recipientType], call the correct API method
            switch (this.messageToBeSent.GUIData.recipientType) {
                // Both user cases call the same API method, we'll set the [isToAll] param correctly
                case 'users':
                case 'allUsers':
                    this.sendToUserMessageCenterMessage(
                        this.messageToBeSent.Recipients,
                        this.messageToBeSent.Subject,
                        this.messageToBeSent.Message,
                        // [isToAll] if [recipientType] is 'allUsers'
                        (this.messageToBeSent.GUIData.recipientType === 'allUsers'),
                        this.messageToBeSent.Attachments
                    ).subscribe(
                        (success: any) => {
                            this.toastService.presentToast('Your message has been sent!');
                            this.resetMessageToBeSent();
                            this.isLoading = false;
                            this.replyInfo.replySubject = null;
                        },
                        (error) => {
                            console.log('error: ', error);
                            this.isLoading = false;
                        }
                    );
                    break;
                case 'section':
                    this.sendToSectionMessageCenterMessage(
                        this.messageToBeSent.Section,
                        this.messageToBeSent.Subject,
                        this.messageToBeSent.Message,
                        this.messageToBeSent.Attachments
                    ).subscribe(
                        (success: any) => {
                            this.toastService.presentToast('Your message has been sent!');
                            this.resetMessageToBeSent();
                            this.isLoading = false;
                            this.replyInfo.replySubject = null;
                        },
                        (error) => {
                            console.log('error: ', error);
                            this.isLoading = false;
                        }
                    );
                    break;
                case 'districts':
                    this.sendToDistrictOrGroupMessageCenterMessage(
                        this.messageToBeSent.Districts,
                        this.messageToBeSent.Groups,
                        this.messageToBeSent.Subject,
                        this.messageToBeSent.Message,
                        this.messageToBeSent.Attachments
                    ).subscribe(
                        (success: any) => {
                            this.toastService.presentToast('Your message has been sent!');
                            this.resetMessageToBeSent();
                            this.isLoading = false;
                            this.replyInfo.replySubject = null;
                        },
                        (error) => {
                            console.log('error: ', error);
                            this.isLoading = false;
                        }
                    );
                    break;
            }
        }, (rejected) => {
            // Rejected either by validationErrors or canceled. Alert the user unless they canceled it
            if (!rejected.isCanceled) {
                this.alertController.create({
                    message: 'Your message failed to send.<br><br>'
                        + rejected.validationMessage,
                    buttons: [{ text: 'OK', role: 'ok' }]
                }).then(alertElement => {
                    alertElement.present();
                });
                this.isLoading = false;
            }
        });
    }

    // Run a smidge of quick front-end validation on [messageToBeSent]. This is likely quicker to catch
    // issues than sending to the API and waiting on an error response
    private async _validateMessageTobeSent(): Promise<any> {
        // Return the promise of an eventual result
        return await new Promise(async (resolve, reject) => {

            // Innocent until proven guilty
            const output = {
                isValid: true,
                isCanceled: false,
                validationMessage: ''
            };

            // A recipient is selected?
            switch (this.messageToBeSent.GUIData.recipientType) {
                case 'users':
                    if (this.messageToBeSent.Recipients.length === 0) {
                        output.isValid = false;
                        output.validationMessage += 'You must select at least one User to send to.<br><br>';
                    }
                    break;
                case 'section':
                    if (!this.messageToBeSent.Section) {
                        output.isValid = false;
                        output.validationMessage += 'You must select a Section to send to.<br><br>';
                    }
                    break;
                case 'districts':
                    if (this.messageToBeSent.Districts.length === 0 && this.messageToBeSent.Groups.length === 0) {
                        output.isValid = false;
                        output.validationMessage += 'You must select at least one District or Group to send to.<br><br>';
                    }
                    break;
            }

            // The subject is not too long?
            if (this.messageToBeSent.Subject.length > 255) {
                output.isValid = false;
                output.validationMessage += 'The Subject is too long, the max is 255 characters.<br><br>';
            }

            // Finally, if still valid...
            if (output.isValid) {
                // Prompt the suer if they're lacking the subject
                if (this.messageToBeSent.Subject.length === 0) {
                    // We'll wait for them to respond to the dialog before proceeding
                    await this.alertController.create({
                        header: 'Send with no Subject?',
                        message: 'Do you really want to send this message with no subject?',
                        buttons: [
                            {
                                text: 'Cancel',
                                handler: () => {
                                    // On cancel, flag [isCanceled] and reject()
                                    output.isCanceled = true;
                                    reject(output);
                                }
                            },
                            {
                                text: 'Send',
                                handler: () => {
                                    // On confirmation to send, resolve()
                                    resolve(output);
                                }
                            }
                        ]
                    }).then(alertEl => {
                        alertEl.present();
                    });
                } else { // !(this.messageToBeSent.Subject.length === 0)
                    // [isValid] and not [isCanceled], FINALLY resolve as all good
                    resolve(output);
                }
            } else { // !(output.isValid)
                // Reject since it's inValid. Any and all [validationmessage]s will already be set
                reject(output);
            }
        });
    }


    // When an action is selected and 'GO' clicked
    public async onMasterActionGoClick($event, selectedAction) {
        this.isLoading = true;

        // Depending on the [selectedAction], we'll run the appropriate action on the [selectedMessages]
        const selectedMessages = this.cachedMessages.filter((loopedMessage) => loopedMessage.GUIData.isChecked);

        await new Promise(async (resolve, reject) => {

            switch (selectedAction) {
                case 'archive': {
                    selectedMessages.forEach(async loopedMessage => {

                        await this._onMoveMessageConfirm($event, loopedMessage, 'A', true, 'active');
                    });
                    this.toastService.presentToast('The message(s) have been archived.');
                    resolve(1);
                    this.isLoading = false;
                    break;
                }
                case 'mark read': {
                    const newValue = true;
                    selectedMessages.forEach(async loopedMessage => {

                        await this.updateMessageReadStatus($event, loopedMessage, newValue);
                    });
                    this.toastService.presentToast('The message(s) have been marked as read.');
                    resolve(1);
                    this.isLoading = false;
                    break;
                }
                case 'mark unread': {
                    const newValue = false;
                    selectedMessages.forEach(async loopedMessage => {

                        await this.updateMessageReadStatus($event, loopedMessage, newValue);
                    });
                    this.toastService.presentToast('The message(s) have been marked as unread.');
                    resolve(1);
                    this.isLoading = false;
                    break;
                }
                case 'deleteActive': {
                    selectedMessages.forEach(async loopedMessage => {

                        await this._onMoveMessageConfirm($event, loopedMessage, 'D', true, 'active');
                    });
                    this.toastService.presentToast('The message(s) have been trashed.');
                    resolve(1);
                    this.isLoading = false;
                    break;
                }
                case 'deleteArchive': {
                    selectedMessages.forEach(async loopedMessage => {

                        await this._onMoveMessageConfirm($event, loopedMessage, 'D', true, 'archive');
                    });
                    this.toastService.presentToast('The message(s) have been trashed.');
                    resolve(1);
                    this.isLoading = false;
                    break;
                }
                case 'eradicateDeleted':
                case 'eradicateSent': {
                    const alert = await this.alertController.create({
                        header: 'Confirm Deletion',
                        message: 'This will <strong>permanently</strong> delete the selected message(s).',
                        buttons: [
                            {
                                text: 'Cancel',
                                role: 'cancel',
                                cssClass: 'secondary',
                                handler: () => {
                                    this.isLoading = false;
                                    setTimeout(() => {
                                        this._resetMasterAction();
                                    }, 0);
                            
                                    this.cachedMessages.forEach(loopedMessage => {
                                        if (loopedMessage.GUIData.isChecked) {
                                            loopedMessage.GUIData.isChecked = false;
                                        }
                                    });
                                }
                            }, {
                                text: 'Delete Message(s)',
                                handler: () => {
                                    selectedMessages.forEach(async loopedMessage => {

                                        await this.onEradicateMessageConfirm($event,
                                            loopedMessage, selectedAction === 'eradicateSent' ? 'S' : 'E');
                                    });
                                    this.toastService.presentToast('The message(s) have been deleted.');
                                    resolve(1);
                                    this.isLoading = false;
                                    // If needed, return to the [subView]
                                    if (this.messageID > 0) {
                                        this.navController.navigateBack('/messagecenter/' + this.subView);
                                    }
                                }
                            }
                        ]
                    });
                    await alert.present();

                    break;
                }
                case 'restoreDeleted': {
                    selectedMessages.forEach(async loopedMessage => {

                        await this._onMoveMessageConfirm($event, loopedMessage, 'D', false, 'deleted');
                    });
                    this.toastService.presentToast('The message(s) have been restored.');
                    resolve(1);
                    this.isLoading = false;
                    break;
                }
                case 'restoreArchived': {
                    selectedMessages.forEach(async loopedMessage => {

                        await this._onMoveMessageConfirm($event, loopedMessage, 'A', false, 'archive');
                    });
                    this.toastService.presentToast('The message(s) have been restored.');
                    this.isLoading = false;
                    resolve(1);
                    break;
                }
            }
        });
        this.cachedMessages.forEach(async loopedMessage => {
            loopedMessage.GUIData.isChecked = false;
        })
        
        setTimeout(() => {
            this._resetMasterAction();
        }, 0);
        
    }

    private _resetMasterAction() {
        this.masterActions = {
            selectedAction: '',
            selectDisabled: true,
            // Number of selected messages
            numberOfSelected: 0,
            // Flag for select all checkbox
            someSelected: false
        };
    }

    // Alert for deletion of messages in trash or sent
    public async onEradicateMessageClick($event: Event, messageToEradicate: MessageInfo, charSwitch: any) {
        // Stop propagation of other events, like the row click event
        $event.stopImmediatePropagation();
        const alert = await this.alertController.create({
            header: 'Confirm Deletion',
            message: 'This will <strong>permanently</strong> delete the message.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary'
                }, {
                    text: 'Delete Message',
                    handler: () => {
                        this.onEradicateMessageConfirm($event, messageToEradicate, charSwitch);
                        // If needed, return to the [subView]
                        if (this.messageID > 0) {
                            this.navController.navigateBack('/messagecenter/' + this.subView);
                        }
                    }
                }
            ]
        });
        await alert.present();
    }

    // Permanantly deletes items
    public async onEradicateMessageConfirm($event: Event, messageToEradicate: MessageInfo, charSwitch: any) {
        return await new Promise(async (resolve, reject) => {
            const newValue = true;

            this.updateMessageStatus(messageToEradicate.MessageID, newValue, charSwitch).subscribe(
                (success: any) => {

                    if (charSwitch === 'E') {
                        this.deletedMessages = this.deletedMessages.filter(loopedMessage => {
                            return loopedMessage.MessageID !== messageToEradicate.MessageID;
                        });
                    } else if (charSwitch === 'S') {
                        this.sentMessages = this.sentMessages.filter(loopedMessage => {
                            return loopedMessage.MessageID !== messageToEradicate.MessageID;
                        });
                    }
                    this.updateCachedMessages();
                    this.getUnreadCounts().subscribe(
                        (unreadCounts: any) => {
                            this.unreadCounts = unreadCounts;
                            resolve(1);
                        },
                        (error) => {
                            console.log('error: ', error);
                            reject(error);
                        }
                    );
                },
                (error) => {
                    console.log('error: ', error);
                    reject(error);
                }
            );
        });
    }

    private async _onMoveMessageConfirm($event: Event, messageToMove: MessageInfo, charFlag: any, newValue: any, fromFlag: any) {
        return await new Promise(async (resolve, reject) => {

            this.updateMessageStatus(messageToMove.MessageID, newValue, charFlag).subscribe(
                (success: any) => {
                    // Inbox to Archive
                    if (charFlag === 'A' && newValue === true) {
                        this.activeMessages = this.activeMessages.filter(loopedMessage => {
                            return loopedMessage.MessageID !== messageToMove.MessageID;
                        });
                        this.updateCachedMessages();
                        this.archivedMessages.push(messageToMove);
                    } else if (charFlag === 'A' && newValue === false) {
                        // Archive to Inbox
                        this.archivedMessages = this.archivedMessages.filter(loopedMessage => {
                            return loopedMessage.MessageID !== messageToMove.MessageID;
                        });
                        this.updateCachedMessages();
                        this.activeMessages.push(messageToMove);
                    } else if (charFlag === 'D' && newValue === true) {
                        // Inbox to Trash
                        if (fromFlag === 'active') {
                            this.activeMessages = this.activeMessages.filter(loopedMessage => {
                                return loopedMessage.MessageID !== messageToMove.MessageID;
                            });
                            this.updateCachedMessages();
                            this.deletedMessages.push(messageToMove);
                        } else if (fromFlag === 'archive') {
                            // Archive to Trash
                            this.archivedMessages = this.archivedMessages.filter(loopedMessage => {
                                return loopedMessage.MessageID !== messageToMove.MessageID;
                            });
                            this.updateCachedMessages();
                            this.deletedMessages.push(messageToMove);
                        }
                    } else if (charFlag === 'D' && newValue === false) {
                        // Trash to Inbox or Archive depending
                        this.deletedMessages = this.deletedMessages.filter(loopedMessage => {
                            return loopedMessage.MessageID !== messageToMove.MessageID;
                        });
                        this.updateCachedMessages();
                        this.activeMessages.push(messageToMove);
                    }

                    this.getUnreadCounts().subscribe(
                        (unreadCounts: any) => {
                            this.unreadCounts = unreadCounts;
                            resolve(1);
                        },
                        (error) => {
                            console.log('error: ', error);
                            reject(error);
                        }
                    );

                    // If needed, return to the [subView]
                    if (this.messageID > 0) {
                        resolve(1);
                        this.navController.navigateBack('/messagecenter/' + this.subView);
                    }

                },
                (error) => {
                    console.log('error: ', error);
                    reject(error);
                }
            );
        });
    }

    // Moves messages between inbox, trash, and archive
    public onMoveMessageClick($event: Event, messageToMove: MessageInfo, charFlag: any, newValue: any, fromFlag: any) {
        // Stop propagation of other events, like the row click event
        $event.stopImmediatePropagation();
        this._onMoveMessageConfirm($event, messageToMove, charFlag, newValue, fromFlag);
    }

    public async updateMessageReadStatus($event: Event, messageToMark: MessageInfo, newValue: boolean) {
        return await new Promise(async (resolve, reject) => {
            const charFlag = 'R';
            this.updateMessageStatus(messageToMark.MessageID, newValue, charFlag).subscribe(
                (success: any) => {
                    // Firstly upon completion, swap the local property
                    messageToMark.IsReadReceipt = newValue;
                    this.getUnreadCounts().subscribe(
                        (unreadCounts: any) => {
                            this.unreadCounts = unreadCounts;
                            resolve(1);
                        },
                        (error) => {
                            console.log('error: ', error);
                            reject(error);
                        }
                    );
                },
                (error) => {
                    console.log('error: ', error);
                    reject(error);
                }
            );
        });
    }

    public updateCachedMessages() {
        switch (this.subView) {
            case MessageCenterTab.Inbox: {
                this.cachedMessages = this.activeMessages;
                break;
            }
            case MessageCenterTab.Sent: {
                this.cachedMessages = this.sentMessages;
                break;
            }
            case MessageCenterTab.Trash: {
                this.cachedMessages = this.deletedMessages;
                break;
            }
            case MessageCenterTab.Archive: {
                this.cachedMessages = this.archivedMessages;
                break;
            }
        }

    }

    /* API METHODS **********************/
    getServerInfo(): Observable<object> {
        const observable = new Observable<MessageCenterModel.MessageCenterServerInfo>(subscriber => {
            /**
             * ServerInfo may have been gathered already.
             * If we hit that case we just return [this.ServerInfo].
             */
            const noServerInfo = !(this.serverInfo);
            if (noServerInfo) {
                // Getting serverInfo from API.
                this.apiBaseService.get(_coreAPIRoot, 'messagecenter/getServerInfo')
                    .subscribe(
                        (serverInfo: MessageCenterModel.MessageCenterServerInfo) => {
                            this.serverInfo = serverInfo;
                            subscriber.next(this.serverInfo);
                            subscriber.complete();
                        },
                        (error) => {
                            console.log('error: ', error);
                            subscriber.error(error);
                        });
            } else {
                // Already had serverInfo.
                subscriber.next(this.serverInfo);
                subscriber.complete();
            }
        });
        return observable;
    }

    sendToUserMessageCenterMessage(recipientObjects, subject, body, isToAll, attachments): Observable<object> {
        // For this existing method, [recipients] is expected to be a list of username strings
        const recipients = recipientObjects.map(r => r.Username);
        // initialize the payload object to pass into the  API call
        const payload = { recipients, subject, body, isToAll, attachments };
        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/sendToUserMessageCenterMessage', JSON.stringify(payload));
    }

    sendMessageCenterMessageToUser(recipientID, subject, body): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { recipientID, subject, body };
        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/sendMessageToUser', JSON.stringify(payload));
    }

    sendToSectionMessageCenterMessage(sectionID, subject, body, attachments): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { sectionID, subject, body, attachments };
        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/sendToSectionMessageCenterMessage', JSON.stringify(payload));
    }

    sendToDistrictOrGroupMessageCenterMessage(districtIDs, groupRoleIDs, subject, body, attachments): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { districtIDs, groupRoleIDs, subject, body, attachments };

        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/sendToDistrictOrGroupMessageCenterMessage', JSON.stringify(payload));
    }

    getActiveMessages(senderOrRecipientBool, isArchived): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { senderOrRecipientBool, isArchived };

        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/getActiveMessages', JSON.stringify(payload));
    }

    getGroupMessageRecipientList(messageID): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { messageID };

        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/getGroupMessageRecipientList', JSON.stringify(payload));
    }

    getDeletedMessages(senderOrRecipientBool): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { senderOrRecipientBool };

        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/getDeletedMessages', JSON.stringify(payload));
    }

    getUserInfo(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot,
            'messagecenter/getUserInfo');
    }

    updateMessageStatus(msgID, newStatus, charFlag): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { msgID, newStatus, charFlag };

        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/updateMessageStatus', JSON.stringify(payload));
    }

    updateSignature(newSignatureText): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { newSignatureText };

        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/updateSignature', JSON.stringify(payload));
    }

    checkForAttachments(msgID): Observable<object> {
        // initialize the payload object to pass into the  API call
        const payload = { msgID };

        return this.apiBaseService.post(_coreAPIRoot,
            'messagecenter/checkForAttachments', JSON.stringify(payload));
    }

    getUnreadCounts(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot,
            'messagecenter/getUnreadCounts');
    }

    checkForSignature(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot,
            'messagecenter/checkForSignature');
    }

    getDistrictsForMessage(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot,
            'messagecenter/getDistrictsForMessage');
    }

    getRolesForMessage(): Observable<object> {
        return this.apiBaseService.get(_coreAPIRoot,
            'messagecenter/getRolesForMessage');
    }

    // Called from [_init()], sets, if needed, [messageCenterProvider.unreadCounts]
    public async updateUnreadCounts(): Promise<void> {
        // Returning the wait of a promise of an eventual result
        return await new Promise(async (resolve, reject) => {
                this.getUnreadCounts().subscribe(
                    (unreadCounts: any) => {
                        this.unreadCounts = unreadCounts;
                        resolve();
                    },
                    (error) => {
                        console.log('error: ', error);
                        // Resolve to complete the wait for this method
                        reject(error);
                    }
                );
        });
    }


}
