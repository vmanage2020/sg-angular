import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillGridComponent } from './skill-grid.component';

describe('SkillGridComponent', () => {
  let component: SkillGridComponent;
  let fixture: ComponentFixture<SkillGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
