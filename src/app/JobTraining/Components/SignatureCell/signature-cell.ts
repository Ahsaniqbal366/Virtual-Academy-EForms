import { Component, OnInit, Input } from '@angular/core';
import { SignatureInfo } from '../../Providers/Model';
// define component
@Component({
  selector: 'app-signature-cell',
  templateUrl: 'signature-cell.html',
  styleUrls: ['../../page.scss']
})

/** This component is for the JobTraining header with ion back and menu button */
export class SignatureCellComponent implements OnInit {
  @Input() Signatures: SignatureInfo[];

  // define service provider and route provider when component is constructed
  constructor() { }

  ngOnInit() { }

}
