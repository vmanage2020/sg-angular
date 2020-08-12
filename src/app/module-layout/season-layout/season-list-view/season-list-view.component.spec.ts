import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonListViewComponent } from './season-list-view.component';

describe('SeasonListViewComponent', () => {
  let component: SeasonListViewComponent;
  let fixture: ComponentFixture<SeasonListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
