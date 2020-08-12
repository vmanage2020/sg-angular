import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsListEditComponent } from './sports-list-edit.component';

describe('SportsListEditComponent', () => {
  let component: SportsListEditComponent;
  let fixture: ComponentFixture<SportsListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SportsListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
