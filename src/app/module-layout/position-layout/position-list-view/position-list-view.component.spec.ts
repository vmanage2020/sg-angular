import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionListViewComponent } from './position-list-view.component';

describe('PositionListViewComponent', () => {
  let component: PositionListViewComponent;
  let fixture: ComponentFixture<PositionListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
