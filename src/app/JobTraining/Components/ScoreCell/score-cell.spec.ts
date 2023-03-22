import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ScoreCellComponent } from './score-cell';

describe('ProgramPage', () => {
  let component: ScoreCellComponent;
  let fixture: ComponentFixture<ScoreCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScoreCellComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
