import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatMenu } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { StatusEnums } from '../../eforms.constants';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent  implements OnInit,AfterViewInit {

  public readonly StatusEnums = StatusEnums;
  displayedColumns: string[] = ['rName', 'aName', 'dReq', 'status', 'view'];
  menuItems : String[] = Object.values(StatusEnums);


  ELEMENT_DATA = [
    { id: 1, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 2, rName: 'A Doe', aName: 'SLS', dReq: '11/22/2022', status: "In Progress", view: '' },
    { id: 3, rName: 'B Doe', aName: 'SLS', dReq: '11/22/2022', status: "Close", view: '' },
    { id: 4, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
    { id: 5, rName: 'John Doe', aName: 'SLS', dReq: '11/22/2022', status: "New", view: '' },
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
    this.router.navigateByUrl('');
  }
}
