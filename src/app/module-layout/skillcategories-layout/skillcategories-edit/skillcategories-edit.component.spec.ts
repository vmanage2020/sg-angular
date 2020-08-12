import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillcategoriesEditComponent } from './skillcategories-edit.component';

describe('SkillcategoriesEditComponent', () => {
  let component: SkillcategoriesEditComponent;
  let fixture: ComponentFixture<SkillcategoriesEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillcategoriesEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillcategoriesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
