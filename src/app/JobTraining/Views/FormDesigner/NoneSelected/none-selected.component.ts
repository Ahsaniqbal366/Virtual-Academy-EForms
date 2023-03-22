import { Component, OnInit } from '@angular/core';
import { FormDesignerService } from '../form-designer.service';


// define component
@Component({
    selector: 'form-designer-none-selected',
    templateUrl: 'none-selected.component.html',
    styleUrls: ['../../../page.scss']
})

export class NoneSelectedComponent implements OnInit {
    constructor(
        private formDesignerService: FormDesignerService
    ) {
    }

    /*******************************************
    * PUBLIC VARIABLES
    *******************************************/

    /*******************************************
    * PRIVATE VARIABLES
    *******************************************/

    /*******************************************
    * PUBLIC METHODS
    *******************************************/


    /*******************************************
    * PRIVATE METHODS
    *******************************************/


    /*******************************************
    * SELF INIT
    *******************************************/
    ngOnInit() {
        // Calling [setSelectedTabName] helps keep the selected tab/button activated if user refreshes page.
        this.formDesignerService.setSelectedTabName('none');
    }

}