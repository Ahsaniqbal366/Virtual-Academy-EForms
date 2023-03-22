import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignatureCellComponent } from './signature-cell';

describe('ProgramPage', () => {
  let component: SignatureCellComponent;
  let fixture: ComponentFixture<SignatureCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignatureCellComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignatureCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
