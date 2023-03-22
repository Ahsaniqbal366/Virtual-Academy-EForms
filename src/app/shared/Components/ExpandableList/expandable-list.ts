import { Component, AfterViewInit, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-expandable-list',
  templateUrl: './expandable-list.html',
  styleUrls: ['../../../app.component.scss']
})
export class ExpandableListComponent implements AfterViewInit {
  @ViewChild('expandWrapper', { read: ElementRef }) expandWrapper: ElementRef;
  @Input() expanded: boolean;
  @Input() expandHeight: string;

  constructor(public renderer: Renderer2) { }

  ngOnInit() {
    this.expandHeight = 'auto';
  }

  ngAfterViewInit() {
    this.renderer.setStyle(this.expandWrapper.nativeElement, 'max-height', this.expandHeight);
  }
}
