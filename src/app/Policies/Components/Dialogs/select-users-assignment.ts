import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { PoliciesManagementService } from '../../Providers/policies.service';
import { Output, EventEmitter } from '@angular/core';
import { PoliciesUserInfo } from '../../Providers/policies.model'

@Component({
  selector: 'select-users-assignment',
  templateUrl: 'select-users-assignment.html',
  styleUrls: ['../../policies.page.scss']
})

export class SelectUserAssignment implements OnInit, AfterViewInit, OnDestroy {  
  public userAssignmentMultiSelect: FormControl;
  public userAssignmentMultiFilterSelect: FormControl = new FormControl();
  public filteredUsersMulti: ReplaySubject<any> = new ReplaySubject(1);
  protected policiesUserInfo: PoliciesUserInfo[];
  public selectArray: Array<any> = [];

  @Input() selectedValues: Array<any>;
  @Output() onDropdownChange = new EventEmitter();
  
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;
  
  protected _onDestroy = new Subject();

  constructor(
    public policiesManagementService: PoliciesManagementService,
  ) { }
  
  ngOnInit() {
    console.log("check selected values", this.selectedValues);
    if(this.selectedValues != undefined){
      this.selectedValues.forEach(element => {
        this.selectArray.push(element.userId);
      });
    }
    else{
      this.setInitialValue();
    }
    this._gatherPoliciesUsers();
  }
  
  ngAfterViewInit() {
  //   this.setInitialValue();
  }

  ngOnDestroy() {
    // this._onDestroy.next();
    // this._onDestroy.complete();
  }
  
  getValue(data: any){
    this.onDropdownChange.emit(data.value);
  }

  protected setInitialValue() {
    this.filteredUsersMulti
      .pipe(take(2), takeUntil(this._onDestroy))
      .subscribe(() => {
          this.multiSelect.compareWith = (a: PoliciesUserInfo, b: PoliciesUserInfo) => a && b && a.id === b.id;
      });
  }

  protected filterUserMulti() {
    if (!this.policiesUserInfo) {
      return;
    }
  
    let search = this.userAssignmentMultiFilterSelect.value;
    if (!search) {
      this.filteredUsersMulti.next(this.policiesUserInfo.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
  
    this.filteredUsersMulti.next(
      this.policiesUserInfo.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
    );
  }

  private _gatherPoliciesUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
        this.policiesManagementService.getPoliciesUserInfo().subscribe((policies) => {
            this.policiesUserInfo = policies as PoliciesUserInfo[];
            this.userAssignmentMultiSelect = new FormControl(this.selectArray);
            this.filteredUsersMulti.next(this.policiesUserInfo.slice());
            this.userAssignmentMultiFilterSelect.valueChanges
                  .pipe(takeUntil(this._onDestroy))
                  .subscribe(() => {
                    this.filterUserMulti();
                  });
            resolve();
        },
            (error) => {
                console.error('policies-error: ', error);
                reject();
            });
    });
}
}