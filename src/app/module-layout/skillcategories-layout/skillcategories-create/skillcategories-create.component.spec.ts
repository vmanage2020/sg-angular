import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillcategoriesCreateComponent } from './skillcategories-create.component';

describe('SkillcategoriesCreateComponent', () => {
  let component: SkillcategoriesCreateComponent;
  let fixture: ComponentFixture<SkillcategoriesCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillcategoriesCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillcategoriesCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
