import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TermsOfUseDialogComponent } from './terms-of-use-dialog.component';

describe('TermsOfUseDialogComponent', () => {
  let component: TermsOfUseDialogComponent;
  let fixture: ComponentFixture<TermsOfUseDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsOfUseDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TermsOfUseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
