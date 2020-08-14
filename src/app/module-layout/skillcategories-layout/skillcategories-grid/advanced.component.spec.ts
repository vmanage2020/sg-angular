import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillcategoriesGridComponent } from './skillcategories-grid.component';

describe('SkillcategoriesGridComponent', () => {
  let component: SkillcategoriesGridComponent;
  let fixture: ComponentFixture<SkillcategoriesGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillcategoriesGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillcategoriesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
