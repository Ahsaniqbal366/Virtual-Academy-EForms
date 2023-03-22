import { Injectable, OnInit } from '@angular/core';
import { isNullOrUndefined } from 'is-what';

export class DNNEmbedConfig {
    // Default [IsEmbedded] value to false.
    IsEmbedded = false;
}

@Injectable()
export class DNNEmbedService {

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/
    private _embedConfig: DNNEmbedConfig;

    /*******************************************
    * PUBLIC METHODS
    *******************************************/
    public getConfig(): DNNEmbedConfig {
        return this._tryGetEmbedConfig();
    }

    public tryMessageDNNSite(messageData): void {
        this._tryGetEmbedConfig();
        if (this._embedConfig.IsEmbedded) {
            this._messageDNNWindow(messageData);
        }
    }

    /*******************************************
    * PRIVATE METHODS
    *******************************************/

    /**
     * The Ionic app can be embedded in an <iframe> on the DNN site.
     * Use [localStorage] to check for a 'DNN-Ionic-Embed-Config' object.
     * If the object exists we can assume it's the embedded case.
     */
    private _tryGetEmbedConfig() {
        if (isNullOrUndefined(this._embedConfig)) {
            const sEmbedConfig = localStorage.getItem('DNN-Ionic-Embed-Config');
            if (!isNullOrUndefined(sEmbedConfig)) {
                try {
                    this._embedConfig = JSON.parse(sEmbedConfig);
                } catch (ex) {
                    /**
                     * [localStorage] data existed, but couldn't be parsed. Fallback to some default
                     * data that we can assume for the "IsEmbedded" case.
                     */
                    this._embedConfig = new DNNEmbedConfig();
                    this._embedConfig.IsEmbedded = true;
                }
            } else {
                /**
                 * No [localStorage] data was found for the embed config. Fallback to default
                 * [DNNEmbedConfig] object data.
                 */
                this._embedConfig = new DNNEmbedConfig();
            }
        }
        return this._embedConfig;
    }

    /**
     * Sends a message out to the parent DNN window, if possible.
     * -----
     * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
     */
    private _messageDNNWindow(messageData): void {
        window.parent.postMessage(messageData, location.origin);
    }
}
