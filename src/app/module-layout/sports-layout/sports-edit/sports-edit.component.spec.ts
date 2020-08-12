import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsEditComponent } from './sports-edit.component';

describe('SportsEditComponent', () => {
  let component: SportsEditComponent;
  let fixture: ComponentFixture<SportsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SportsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
