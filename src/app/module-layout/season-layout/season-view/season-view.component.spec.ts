import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonViewComponent } from './season-view.component';

describe('SeasonViewComponent', () => {
  let component: SeasonViewComponent;
  let fixture: ComponentFixture<SeasonViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
