import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StatusCellComponent } from './status-cell';

describe('ProgramPage', () => {
  let component: StatusCellComponent;
  let fixture: ComponentFixture<StatusCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StatusCellComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
