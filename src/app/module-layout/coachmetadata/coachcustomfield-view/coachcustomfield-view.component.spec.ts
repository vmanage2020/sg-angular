import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachcustomfieldViewComponent } from './coachcustomfield-view.component';

describe('CoachcustomfieldViewComponent', () => {
  let component: CoachcustomfieldViewComponent;
  let fixture: ComponentFixture<CoachcustomfieldViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachcustomfieldViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachcustomfieldViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
