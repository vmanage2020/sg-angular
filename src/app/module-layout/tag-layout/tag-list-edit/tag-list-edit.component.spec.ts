import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagListEditComponent } from './tag-list-edit.component';

describe('TagListEditComponent', () => {
  let component: TagListEditComponent;
  let fixture: ComponentFixture<TagListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
