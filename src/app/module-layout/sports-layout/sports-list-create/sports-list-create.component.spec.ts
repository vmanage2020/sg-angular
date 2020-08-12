import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SportsListCreateComponent } from './sports-list-create.component';

describe('SportsListCreateComponent', () => {
  let component: SportsListCreateComponent;
  let fixture: ComponentFixture<SportsListCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SportsListCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SportsListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
