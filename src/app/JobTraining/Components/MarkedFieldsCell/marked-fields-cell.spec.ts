import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MarkedFieldsCellComponent } from './marked-fields-cell';

describe('ProgramPage', () => {
  let component: MarkedFieldsCellComponent;
  let fixture: ComponentFixture<MarkedFieldsCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MarkedFieldsCellComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MarkedFieldsCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
