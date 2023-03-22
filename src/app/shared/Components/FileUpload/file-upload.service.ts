import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIBaseService } from '../../API.Base.Service';
import { AlertDialogFactory } from '../../Utilities/AlertDialog/alert-dialog';
import { API_URLS } from 'src/environments/environment';

const _coreAPIRoot = API_URLS.Core;

@Injectable()
export class FileUploadService {
  constructor(
    private _apiBaseService: APIBaseService,
    private _alertDialogFactory: AlertDialogFactory
  ) { }

  // Returns the promise of a Fetch API Response with the url to the newly updated file
  public async asyncSaveFileToCloud(uploadedFile: File, config: FileUploadConfig): Promise<Response> {
    // Returning the promise of an eventual result
    return await new Promise(async (resolve, reject) => {
      // Cache the [fileExtention] to compare to the allowed types
      const fileExtention = uploadedFile.name.split('.').pop().toLowerCase();

      // Setup default values if nothing was passed in.
      config.maxFileSize = config.maxFileSize ? config.maxFileSize : 100;
      config.validFileTypes = config.validFileTypes ? config.validFileTypes :
        ['doc', 'docx', 'txt', 'rtf', 'csv', 'xls', 'xlsx', 'jpeg', 'jpg', 'pdf', 'png', 'ppt', 'pptx', 'zip', 'gif'];
      config.relativeAPIRoute = config.relativeAPIRoute ? config.relativeAPIRoute : 'messagecenter/uploadMessageAttachment';

      // Validate
      if (config.validFileTypes.indexOf(fileExtention) === -1) {
        reject('The selected file type is not allowed.');
      } else if (uploadedFile.size / 1024 / 1024 > config.maxFileSize) {
        reject('The selected file is too large.');
      } else {
        // Validation passed, det up the FormData payload
        const payload = new FormData();
        payload.append('upload', uploadedFile);
        payload.append('JWT', localStorage.getItem('JWT-Access-Token'));
        // Return the API Fetch
        return fetch(_coreAPIRoot + config.relativeAPIRoute, {
          method: 'POST',
          body: payload
        }).then(response => {
          // Resolve to complete the wait for this method
          resolve(response.json());
        });
      }
    });
  }

  /** 
   * Save the given file to the cloud
   */
  public saveFileToCloud(file: File, config: FileUploadInputConfig): Observable<object> {
    let hasValidationError: boolean;
    let validationErrorMessage: string;
    let validationErrorHeader: string;

    const ext = file.name.split('.').pop().toLowerCase();

    // setup my default values if nothing was passed in.
    config.maxFileSize_MB = config.maxFileSize_MB ? config.maxFileSize_MB : 50;
    config.validFileTypes = config.validFileTypes ? config.validFileTypes :
      [
        'doc', 'docx', 'txt', 'rtf', 'csv', 'xls', 'xlsx', 'jpeg', 'jpg',
        'pdf', 'png', 'ppt', 'pptx', 'zip', 'gif'
      ];

    config.additionalParameters = config.additionalParameters ? config.additionalParameters : {};

    // do some file validation
    if (config.validFileTypes.indexOf(ext) === -1) {
      hasValidationError = true;
      validationErrorHeader = 'Invalid Type';
      validationErrorMessage = 'The selected file type is not allowed.';
    } else if (file.size / 1024 / 1024 > config.maxFileSize_MB) {
      hasValidationError = true;
      validationErrorHeader = 'Too Large';
      validationErrorMessage = 'The selected file is too large.';
    }

    if (hasValidationError) {
      /**
       * Prompt the user of the error here. This is clean up the consuming code so they don't
       * have to repeat alert logic every time and prevent duplicate alerts if the
       * [_apiBaseService.postFormData] call fails.
       */
      this._alertDialogFactory.openDialog({
        header: validationErrorHeader,
        message: validationErrorMessage,
        buttonText: 'OK',
        // [disableClose] - Let user click outside to close.
        disableClose: false
      });

      return new Observable<any>(subscriber => {

        subscriber.error(validationErrorMessage);
        subscriber.complete();
      });
    }
    else {
      const fd = new FormData();

      // Add the file as an 'upload' parameter.
      fd.append('upload', file);

      return this._apiBaseService.postFormData(config.apiRoot, config.apiCallMethod, fd, config.additionalParameters);
    }
  }
}


export class FileUploadInputConfig {
  public maxFileSize_MB: number;
  public validFileTypes: string[];

  // EXAMPLE:
  //   additionalParameters: {
  //      'name1': 'value1',
  //      'name2': 'value2'
  //    }
  public additionalParameters: {};

  public apiRoot: string;
  public apiCallMethod: string;

  // bit to signify if the uploaded should automatically upload
  // or allow the parent component to upload when ready
  public autoSubmit?: boolean = false;
}

export class FileUploadConfig {
  public maxFileSize: number;
  public validFileTypes: string[];
  public relativeAPIRoute: string;
}

