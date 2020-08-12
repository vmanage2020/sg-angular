import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsListViewComponent } from './sports-list-view.component';

describe('SportsListViewComponent', () => {
  let component: SportsListViewComponent;
  let fixture: ComponentFixture<SportsListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SportsListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
