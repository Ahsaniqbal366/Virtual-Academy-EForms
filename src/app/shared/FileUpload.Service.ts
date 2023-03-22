import { Injectable } from '@angular/core';
import { API_URLS } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { APIBaseService } from './API.Base.Service';

const _coreAPIRoot = API_URLS.Core;

@Injectable({
  providedIn: 'root'
})

export class FileUploadService {
  constructor(private apiBaseService: APIBaseService) { }

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

  public deleteFileFromCloud(urls): Observable<object> {
    const payload = { urls };
    return this.apiBaseService.post(_coreAPIRoot, 'fileHandling/deleteElementFromCloud', JSON.stringify(payload));
  }

}

export class FileUploadConfig {
  public maxFileSize: number;
  public validFileTypes: string[];
  public relativeAPIRoute: string;
}
