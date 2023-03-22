import { Injectable } from '@angular/core';
@Injectable({
    providedIn : 'root',
})
export class EFormConstants {

}
export enum StatusEnums {
    new = "New",
    inprogress = "In Progress",
    closed = "Closed",
    archieve = "Archived"
}