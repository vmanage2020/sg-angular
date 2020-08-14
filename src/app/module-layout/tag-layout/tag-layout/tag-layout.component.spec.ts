import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagLayoutComponent } from './tag-layout.component';

describe('TagLayoutComponent', () => {
  let component: TagLayoutComponent;
  let fixture: ComponentFixture<TagLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
