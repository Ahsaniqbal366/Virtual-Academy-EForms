import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';

@Component({
  selector: "app-admin-dashboard",
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.scss"],
})
export class AdminDashboardComponent implements OnInit {
  public eFormRequestsActive: boolean = true;
  public availableFormsActive: boolean = false;

  // displayedColumns: string[] = ['rName', 'aName', 'dReq', 'status', 'view'];

  // ELEMENT_DATA = [
  //   { id: 1, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
  //   { id: 2, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "In Progress", view: '' },
  //   { id: 3, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "Close", view: '' },
  //   { id: 4, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
  //   { id: 5, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
  // ];

  // dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
  // options = ["one", "Two"]

  // @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor() {}
  ngOnInit(): void {}

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  // }

  tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    console.log("index => ", tabChangeEvent.index);
    if (tabChangeEvent.index == 1) {
      this.availableFormsActive = true;
      this.eFormRequestsActive = false;
    } else if (tabChangeEvent.index == 0) {
      this.eFormRequestsActive = true;
      this.availableFormsActive = false;
    }
  };
}
