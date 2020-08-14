import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonLayoutComponent } from './season-layout.component';

describe('SeasonLayoutComponent', () => {
  let component: SeasonLayoutComponent;
  let fixture: ComponentFixture<SeasonLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
