import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusEnums } from 'src/app/eforms/eforms.constants';

@Component({
  selector: 'app-admin-eform-requests',
  templateUrl: './admin-eform-requests.component.html',
  styleUrls: ['./admin-eform-requests.component.scss'],
})
export class AdminEformRequestsComponent  implements OnInit {
  public readonly StatusEnums = StatusEnums;
  displayedColumns: string[] = ['rName', 'aName', 'dReq', 'status', 'view'];
  menuItems : String[] = Object.values(StatusEnums);


  ELEMENT_DATA = [
    { id: 1, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 2, rName: 'A Doe', aName: 'SLS', dReq: '11/22/2022', status: "In Progress", view: '' },
    { id: 3, rName: 'B Doe', aName: 'SLS', dReq: '11/22/2022', status: "Close", view: '' },
    { id: 4, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 5, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 6, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 7, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 8, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 9, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 10, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id:11, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 12, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 13, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 14, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 15, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 16, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },

  ];

  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);
  options = ["one", "Two"]

  @ViewChild(MatPaginator) paginator: MatPaginator;
  selected: string;
  constructor(
    private router : Router
  ) { }

  ngOnInit() {
    console.log(this.dataSource);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  select(state: string, selectedElement : any) {
    this.selected = state;
    this.dataSource.filteredData.find(ele => ele.id == selectedElement.id).status = state;
  }

  viewForm() : void {
    // this.router.navigate(['view']);
    this.router.navigateByUrl('/admin/admin-home/view');
  }
}
