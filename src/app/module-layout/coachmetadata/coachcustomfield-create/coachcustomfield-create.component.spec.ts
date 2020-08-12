import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachcustomfieldCreateComponent } from './coachcustomfield-create.component';

describe('CoachcustomfieldCreateComponent', () => {
  let component: CoachcustomfieldCreateComponent;
  let fixture: ComponentFixture<CoachcustomfieldCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoachcustomfieldCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoachcustomfieldCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
