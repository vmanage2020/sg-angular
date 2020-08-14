import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonGridComponent } from './season-grid.component';

describe('SeasonGridComponent', () => {
  let component: SeasonGridComponent;
  let fixture: ComponentFixture<SeasonGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
