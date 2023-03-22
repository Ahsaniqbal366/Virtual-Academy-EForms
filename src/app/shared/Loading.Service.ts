import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { isNullOrUndefined } from 'is-what';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    loader: HTMLIonLoadingElement;
    isLoading: boolean;
    loaderPresented: boolean;

    constructor(public loadingController: LoadingController) {
    }

    /**
     * Idea mainly taken from this link:
     * https://stackoverflow.com/questions/52574448/ionic-4-loading-controller-dismiss-is-called-before-present-which-will-ke
     * -----
     * Present Loading using the ionic / angular Loading Controller
     * Creating and presenting a loader using {await}, like the docs describe,
     * requires it be in an {async} function. The created loader is stored and must be referenced to dismiss.
     * Similar to intervals, it's possible to pile these loaders by presenting more than one before a dismiss,
     * This seems to replace the reference to the first loader, resulting in it remaining despite multiple calls to dismiss().
     *
     * Created in a service to reduce code, any component can simple call [loadingService.presentLoading] to create a loader, if
     * one does not already exist. This loader is stored on the service and will be dismissed when [loadingService.dismiss()]
     * is called. Afterwards, the variable is {delete}d to return to undefined, allowing another loader to be created.
     *
     * Optionally, as described in the docs, we can pass duration to [presentLoading], making it automatically dismiss after that
     * amount of miliseconds. This isn't really what we're after.
     *
     * Forcing params to null if not included
     *
     * At the start of the function, flag true [isLoading] until the async function completes. This prevents race conditions
     * 
     * JDB 8/11/2020 - Added optional callback param.
     */
    public presentLoading(message: string = null, duration: number = null, callback: Function = null) {
        // This async call could possible take longer than the time before the dismiss, if so, force [dismissLoader] to wait for us
        this.isLoading = true;

        // Check on the existance of a loader. Will only be undefined at the start unless we manually reset it after dismiss, like we do
        if (isNullOrUndefined(this.loader)) {

            // Create and store the reference to the loader
            this.loadingController.create({
                // Shorthand pass for matching named variables
                message,
                duration
            }).then((loader: HTMLIonLoadingElement) => {
                this.loader = loader;
                
                this.loader.present().then(() => {                    
                    // The [loader] is created and presented.

                    // Invoke callback if given.
                    if (callback != null) {
                        callback();
                    }

                    if (!this.isLoading) {
                        /**
                         * If [isLoading] is FALSE that means the code called to dismiss the loader already.
                         * We can just immediately tear down the loader.
                         */
                        this.dismissLoading();
                    }
                });
            });
        } else {
            // A loader exists already, let's just update the loader properties.
            this.loader.duration = duration;
            this.loader.message = message;
        }
    }

    /**
     * Dismiss Loading using the ionic / angular Loading Controller
     * Uses the stored refernce to the loader created by [presentLoading()], will first check to ensure [this.loader] is not null,
     * indicating no existing loader, and will cause error when calling [dismiss()] of undefined
     *
     * Aftter dismissing, the reference to the dismissed loader still exists, to ensure our single loader logic works
     * for the next time [loadingService.presentLoader()], we'll {delete} [this.loader] resetting it to typoeof 'undefined'
     */
    public dismissLoading() {
        this.isLoading = false;
        if (!isNullOrUndefined(this.loader)) {            
            this.loader.dismiss().then(() => {
                delete this.loader;
            });
        }
    }
}
