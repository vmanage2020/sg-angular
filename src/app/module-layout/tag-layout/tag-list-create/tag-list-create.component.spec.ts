import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagListCreateComponent } from './tag-list-create.component';

describe('TagListCreateComponent', () => {
  let component: TagListCreateComponent;
  let fixture: ComponentFixture<TagListCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagListCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
