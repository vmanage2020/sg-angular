import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsViewComponent } from './sports-view.component';

describe('SportsEditComponent', () => {
  let component: SportsViewComponent;
  let fixture: ComponentFixture<SportsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SportsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
