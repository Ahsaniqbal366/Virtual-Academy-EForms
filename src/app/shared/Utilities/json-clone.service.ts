import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class JSONCloneService {
  constructor() { }

    /**
     * [cloneObject]
     * Uses JSON to serialize/deserialize an object to deep-copy it.
     * ---------
     * JTC
     * There doesn't appear to be a method like this built into JS/angular that was working like I needed.
     */
  public cloneObject(object: any) {
    return JSON.parse(JSON.stringify(object));
  }

}
