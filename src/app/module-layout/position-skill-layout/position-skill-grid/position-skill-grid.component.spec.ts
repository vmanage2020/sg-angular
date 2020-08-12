import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionSkillGridComponent } from './position-skill-grid.component';

describe('PositionSkillGridComponent', () => {
  let component: PositionSkillGridComponent;
  let fixture: ComponentFixture<PositionSkillGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionSkillGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionSkillGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
