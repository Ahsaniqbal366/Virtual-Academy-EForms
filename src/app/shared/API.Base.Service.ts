import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { APIResponse, APIResponseError } from './API.Response.Model';
import { AlertController } from '@ionic/angular';
import { AlertDialogFactory } from './Utilities/AlertDialog/alert-dialog';

@Injectable()
export class APIBaseService {
    // initialize the service provider
    constructor(
        private http: HttpClient,
        private _alertDialogFactory: AlertDialogFactory) {}

    get(apiRoot: string, apiCallMethod: string): Observable<object> {

        const apiCallURL = apiRoot + apiCallMethod;

        const httpOptions = this._getHttpOptions();

        const apiCallObservable = this.http.get<any>(apiCallURL, httpOptions);

        return this._handleAPIResponse(apiCallObservable, apiCallURL);
    }
    
    getAll(apiRoot: string, apiCallMethod: string): Observable<object> {

        const apiCallURL = apiRoot + apiCallMethod;

        const httpOptions = this._getHttpOptions();

        const apiCallObservable = this.http.get<any>(apiCallURL, httpOptions);

        return this._handleMultiAPIResponse(apiCallObservable, apiCallURL);
    }

    /**
     * [getWithResponseType] issues a GET command to an HTTP Client to retrieve data from our API.
     */
    getWithResponseType(apiRoot: string, apiCallMethod: string, responseType: string): Observable<object> {
        const apiCallURL = apiRoot + apiCallMethod;

        //define http options
        const httpOptions = this._getHttpOptionsWithResponseType(responseType);

        //define the observable
        const apiCallObservable = this.http.get<any>(apiCallURL, httpOptions);

        //handle the request
        return this._handleAPIResponse(apiCallObservable, apiCallURL);
    }

    /**
     * This method performs a DELETE request using the API route and data object supplied.
     * @param apiCallMethod Partial route to the API method.
     * @param data Data to send with the body of the DELETE request.
     */
    delete(apiRoot: string, apiCallMethod: string): Observable<object> {

        const apiCallURL = apiRoot + apiCallMethod;

        const httpOptions = this._getHttpOptions();

        const apiCallObservable = this.http.delete<APIResponse>(apiCallURL, httpOptions);

        return this._handleAPIResponse(apiCallObservable, apiCallURL);
    }
    
    /**
     * This method performs a DELETE request using the API route and data object supplied.
     * @param apiCallMethod Partial route to the API method.
     * @param data Data to send with the body of the DELETE request.
     */
    put(apiRoot: string, apiCallMethod: string, data: string): Observable<object> {

        const apiCallURL = apiRoot + apiCallMethod;

        const httpOptions = this._getHttpOptions();

        const apiCallObservable = this.http.put<APIResponse>(apiCallURL, data, httpOptions);

        return this._handleAPIResponse(apiCallObservable, apiCallURL);
    }
    
    /**
     * This method performs a PATCH request using the API route and data object supplied.
     * @param apiCallMethod Partial route to the API method.
     */
    patch(apiRoot: string, apiCallMethod: string): Observable<object> {

        const apiCallURL = apiRoot + apiCallMethod;

        const httpOptions = this._getHttpOptions();

        const response =  Response;

        const apiCallObservable = this.http.patch<any>(apiCallURL, response, httpOptions);

        return this._handleAPIResponse(apiCallObservable, apiCallURL);
    }
    
    /**
     * This method performs a POST request using the API route and data object supplied.
     * @param apiCallMethod Partial route to the API method.
     * @param data Data to send with the body of the POST request.
     */
    post(apiRoot: string, apiCallMethod: string, data: string): Observable<object> {

        const apiCallURL = apiRoot + apiCallMethod;

        const httpOptions = this._getHttpOptions();

        const apiCallObservable = this.http.post<APIResponse>(apiCallURL, data, httpOptions);

        return this._handleAPIResponse(apiCallObservable, apiCallURL);
    }

    /**

     * [postFormData] would be used when doing something like uploading a file.
     */
    postFormData(apiRoot: string, apiCallMethod: string, formData: FormData, params: any): Observable<object> {
        let apiCallURL = apiRoot + apiCallMethod;
    
        /**
         * Make new [HttpParams] from our given [params] and add those to the api call URL.
         * https://angular.io/api/common/http/HttpParams
         */
        // let formattedParams = new HttpParams({
        //     fromObject: params
        // });
        // apiCallURL += ('?' + formattedParams.toString());

        const httpOptions = {
            reportProgress: true,
            headers: new HttpHeaders({
                // DON'T SET 'multipart/form-data' AS THE CONTENT TYPE UNLESS YOU KNOW THAT API WORKS.
                // 'Content-Type': 'multipart/form-data',
                'accept': '*/*',
                // 'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                // 'mode': 'no-cors',
                'JWT-Access-Token': this.getJWTAccessToken(false)
            })
        };

        const apiCallObservable = this.http.post<APIResponse>(apiCallURL, formData, httpOptions);

        return this._handleAPIResponse(apiCallObservable, apiCallURL);
    }

    /**
     * This method handles the response of a given api route.
     *
     * If the response is successful, we can update the JWT token, otherwise, throw the error detail.
     *
     * @param response the response to handle
     * @param apiCallURL the full URL of the api route
     */
    private _handleAPIResponse(response: Observable<APIResponse>, apiCallURL: string): Observable<object> {
        return response.pipe(
            map(
                (apiResponse: HttpResponse<any> | APIResponse) => {
                    /*
                     * Handle our API response success/error cases
                     * and throw errors accordingly.
                     */

                     //determine the type of response that is coming back from the API request
                     //if the response is HTTP
                    if(this._isHTTPResponse(apiResponse)){
                        apiResponse = apiResponse as HttpResponse<any>;

                        //if the status is OK
                        if (apiResponse.status == 200) {
                            //this._setJWTAccessToken(apiResponse.userAccessToken);
                            return apiResponse;
                        } else {
                            throw apiResponse;
                        }
                    //otherwise if the response is an API Response
                    }else{
                         apiResponse = apiResponse as APIResponse;
                        if (apiResponse.success) {
                            if(typeof apiResponse.userAccessToken != 'undefined'){
                                this._setJWTAccessToken(apiResponse.userAccessToken);
                            }

                            return apiResponse.data;
                        } else {
                            throw apiResponse.error;
                        }
                    }
                    
                }
            ),
            catchError(
                (error: HttpErrorResponse | APIResponseError) => {
                    console.log(error);
                    /*
                     * We'll ultimately return a formatted [APIResponseError] from the
                     * [catchError] event.
                     */
                    let apiResponseError: APIResponseError;
                    if (this._isHTTPErrorResponse(error)) {
                        // Cast [error] to an instance of [HttpErrorResponse].
                        const httpError = error as HttpErrorResponse;
                        /*
                         * Format the needed information from the [HttpErrorResponse] for use
                         * as a [APIResponseError].
                         */
                        apiResponseError = new APIResponseError(
                            // [APIResponseError.publicResponseMessage]
                            'An unexpected error occurred.',
                            // "Private" [APIResponseError.info]
                            httpError?.error?.Message + ' - ' + httpError.error.MessageDetail,
                            // [APIResponseError.errorCode]
                            httpError.status.toString() + ' - ' + httpError.statusText
                        );
                    /*
                     * Use property/feature detection to check if the given [errorParam]
                     * is of type [APIResponseError].
                     * ---
                     * This case would occur if our API call returned OK, but the output
                     * had a caught error.
                     */
                    } else if ((error as APIResponseError).publicResponseMessage) {
                        // Cast [error] to an instance of [APIResponseError].
                        error = error as APIResponseError;
                        apiResponseError = error;
                    /*
                     * The given [error] param was an unexpected type, return a generic
                     * [APIResponseError] object instance.
                     */
                    } else {
                        apiResponseError = new APIResponseError(
                            // [APIResponseError.publicResponseMessage]
                            'An unexpected error occurred.',
                            // "Private" [APIResponseError.info]
                            'Unknown error type: ' + (typeof error),
                            // [APIResponseError.errorCode]
                            'Error'
                        );
                    }

                    return of(
                        this._handleError(apiCallURL, apiResponseError)
                    );
                }
            )
        );


    }
    
    
    /**
     * This method handles the response of a given api route.
     *
     * If the response is successful, we can update the JWT token, otherwise, throw the error detail.
     *
     * @param response the response to handle
     * @param apiCallURL the full URL of the api route
     */
    private _handleMultiAPIResponse(response: Observable<APIResponse>, apiCallURL: string): Observable<object> {
        return response.pipe(
            map(
                (apiResponse: HttpResponse<any> | APIResponse) => {
                    /*
                     * Handle our API response success/error cases
                     * and throw errors accordingly.
                     */

                     //determine the type of response that is coming back from the API request
                     //if the response is HTTP
                    if(this._isHTTPResponse(apiResponse)){
                        apiResponse = apiResponse as HttpResponse<any>;

                        //if the status is OK
                        if (apiResponse.status == 200) {
                            //this._setJWTAccessToken(apiResponse.userAccessToken);
                            return apiResponse;
                        } else {
                            throw apiResponse;
                        }
                    //otherwise if the response is an API Response
                    }else{
                         apiResponse = apiResponse as APIResponse;
                        if (apiResponse.success) {
                            if(typeof apiResponse.userAccessToken != 'undefined'){
                                this._setJWTAccessToken(apiResponse.userAccessToken);
                            }
                            
                            return apiResponse.data;
                        } else {
                            // throw apiResponse.error;
                        }
                    }
                    
                }
            ),
            catchError(
                (error: HttpErrorResponse | APIResponseError) => {
                    console.log(error);
                    /*
                     * We'll ultimately return a formatted [APIResponseError] from the
                     * [catchError] event.
                     */
                    let apiResponseError: APIResponseError;
                    if (this._isHTTPErrorResponse(error)) {
                        // Cast [error] to an instance of [HttpErrorResponse].
                        const httpError = error as HttpErrorResponse;
                        /*
                         * Format the needed information from the [HttpErrorResponse] for use
                         * as a [APIResponseError].
                         */
                        apiResponseError = new APIResponseError(
                            // [APIResponseError.publicResponseMessage]
                            'An unexpected error occurred.',
                            // "Private" [APIResponseError.info]
                            httpError.error.Message + ' - ' + httpError.error.MessageDetail,
                            // [APIResponseError.errorCode]
                            httpError.status.toString() + ' - ' + httpError.statusText
                        );
                    /*
                     * Use property/feature detection to check if the given [errorParam]
                     * is of type [APIResponseError].
                     * ---
                     * This case would occur if our API call returned OK, but the output
                     * had a caught error.
                     */
                    } else if ((error as APIResponseError).publicResponseMessage) {
                        // Cast [error] to an instance of [APIResponseError].
                        error = error as APIResponseError;
                        apiResponseError = error;
                    /*
                     * The given [error] param was an unexpected type, return a generic
                     * [APIResponseError] object instance.
                     */
                    } else {
                        apiResponseError = new APIResponseError(
                            // [APIResponseError.publicResponseMessage]
                            'An unexpected error occurred.',
                            // "Private" [APIResponseError.info]
                            'Unknown error type: ' + (typeof error),
                            // [APIResponseError.errorCode]
                            'Error'
                        );
                    }

                    return of(
                        this._handleError(apiCallURL, apiResponseError)
                    );
                }
            )
        );


    }

    /**
     * Public method exposing JWT get
     */
    getJWTAccessToken(override:boolean):string{
        if(override) {
            var user: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IntcIlVzZXJJRFwiOjgyMzEsXCJQb3J0YWxJRFwiOjM3LFwiR3JvdXBJRFwiOjQ2LFwiU3RhdGVcIjpcIkRWXCIsXCJJc0FkbWluXCI6XCJGYWxzZVwifSIsIm5iZiI6MTY1NTEzNjU0MSwiZXhwIjoxNjc1NTIyOTQxLCJpYXQiOjE2NzUxMzY1NDF9.XM_I7Tf41cYjrP3YugWa9dTxKlF04NYI3EazzDo6DQU';
            var admin: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IntcIlVzZXJJRFwiOjU0MSxcIlBvcnRhbElEXCI6MzcsXCJHcm91cElEXCI6NDYsXCJTdGF0ZVwiOlwiRFZcIixcIklzQWRtaW5cIjpcIlRydWVcIn0iLCJuYmYiOjE2NTUxMzY1NDEsImV4cCI6MTY3NTUyMjk0MSwiaWF0IjoxNjc1MTM2NTQxfQ.C1zPAV3L32l3NkXdV8p4kEDkmO7o_iggH6Ea3MSbP94';
            return user;
        
        }else{
            return this._getJWTAccessToken();
        }
    }

    /**
     * Public method to remove JWT access token from local storage
     */
    destroyJWTAccessToken():void{
        this._destroyJWTAccessToken();
    }
    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param apiCallURL - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private _handleError(apiCallURL: string, error: APIResponseError) {
        // #TODO - send the error to remote logging infrastructure?
        // #TODO - better job of transforming error for user consumption?
        this._alertDialogFactory.openDialog({
            header: 'Error - ' + error.errorCode,
            message: error.publicResponseMessage,
            buttonText: 'OK',
            // [disableClose] - Let user click outside to close.
            disableClose: false
          });

        // Log more error details to the console.
        console.error(apiCallURL + ' has failed: ', error);
        throw error;
    }

    /*
     * [isHTTPErrorResponse] will use property/feature detection to check if the given [errorParam]
     * is of type [HttpErrorResponse].
     * ---
     * This case would occur for a 404 error, or an uncaught server 500 error.
     */
    private _isHTTPErrorResponse(error: any): boolean {
        let output = false;
        // Cast [error] to an instance of [HttpErrorResponse].
        const httpError = error as HttpErrorResponse;
        /*
         * Check that the [name] property is defined on [httpError] and check that the name
         * value is 'HttpErrorResponse'.
         */
        if ((typeof httpError.name !== 'undefined')
            &&
            (httpError.name.toString() === 'HttpErrorResponse')) {
            output = true;
        }
        return output;
    }

    private _isHTTPResponse(response: any): boolean {
        let output = false;
       
        // Cast [response] to an instance of [HttpResponse].
        const httpResponse = response as HttpResponse<any>;

        /*
         * Check that the [name] property is defined on [httpError] and check that the name
         * value is 'HttpErrorResponse'.
         */
        if (typeof httpResponse.status != 'undefined' && httpResponse.status == 200) {
            output = true;
        }

        return output;
    }

    private _getHttpOptions(): object {
        return  {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'JWT-Access-Token': this.getJWTAccessToken(true)
            })
        };
    }

    /**
     * [_getHttpOptionsWithResponseType] creates an options object with a specialized response type
     */
    private _getHttpOptionsWithResponseType(responseType:string): object {
        return  {
            observe: 'response',
            responseType: responseType,
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'JWT-Access-Token': this.getJWTAccessToken(true)
            })
        };
    }

    private _setJWTAccessToken(jwtAccessToken: string) {
        localStorage.setItem('JWT-Access-Token', jwtAccessToken);
    }
    private _getJWTAccessToken() {
        let jwtAccessToken = localStorage.getItem('JWT-Access-Token');
        if (jwtAccessToken === null) {
            jwtAccessToken = '';
        }
        return jwtAccessToken;
    }

    private _destroyJWTAccessToken():void{
        localStorage.removeItem('JWT-Access-Token');
    }
}
