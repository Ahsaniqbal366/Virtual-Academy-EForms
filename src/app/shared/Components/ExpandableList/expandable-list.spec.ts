import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExpandableListComponent } from './expandable-list';

describe('ProgramPage', () => {
  let component: ExpandableListComponent;
  let fixture: ComponentFixture<ExpandableListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExpandableListComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
