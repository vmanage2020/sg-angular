import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionSkillCreateComponent } from './position-skill-create.component';

describe('PositionSkillCreateComponent', () => {
  let component: PositionSkillCreateComponent;
  let fixture: ComponentFixture<PositionSkillCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionSkillCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionSkillCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
