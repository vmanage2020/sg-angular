import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachcustomfieldEditComponent } from './coachcustomfield-edit.component';

describe('CoachcustomfieldEditComponent', () => {
  let component: CoachcustomfieldEditComponent;
  let fixture: ComponentFixture<CoachcustomfieldEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachcustomfieldEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachcustomfieldEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
