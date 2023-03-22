import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TrendCellComponent } from './trend-cell';

describe('ProgramPage', () => {
  let component: TrendCellComponent;
  let fixture: ComponentFixture<TrendCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrendCellComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TrendCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
