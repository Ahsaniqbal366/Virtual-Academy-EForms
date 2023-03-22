import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'sls-skeleton-table',
    templateUrl: 'skeleton-table.component.html',
    styleUrls: ['skeleton-table.component.scss']
})
/**
 * [SkeletonTableComponent] is a quick way to generate a skeletonized table for use as a placeholder
 * when loading in elements/data to a view.
 */
export class SkeletonTableComponent implements OnInit {

    //default constructor
    constructor() {
    }

    /*******************************************
    * COMPONENT INPUT VARIABLES/EVENTS
    *******************************************/
    @Input() rows: number;
    @Input() columns: number;
    
    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/
    public boneRows: number[];
    public boneColumns: number[];

    /*******************************************
    * PRIVATE METHODS
    *******************************************/
   /**
    * [_createdBones] defines an array of items based on the input parameters for rows and columns
    * that can be iterated on to create a dynamic skeleton table
    * @param count - the number of indices that the array should be defined with
    */
    private _createBones(count: number): number[] {

        let rowCountArray = [];

        for (let i = 0; i < count; i++) {
            rowCountArray.push(i);
        }

        return rowCountArray;
    }


    /*******************************************
    * SELF INIT
    *******************************************/
    ngOnInit() {
        this.boneRows = this._createBones(this.rows);
        this.boneColumns = this._createBones(this.columns);

    }
}

