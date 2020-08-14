import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionSkillEditComponent } from './position-skill-edit.component';

describe('PositionSkillEditComponent', () => {
  let component: PositionSkillEditComponent;
  let fixture: ComponentFixture<PositionSkillEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionSkillEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionSkillEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
