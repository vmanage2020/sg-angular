import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgiDatatableComponent } from './ngi-datatable.component';

describe('NgiDatatableComponent', () => {
  let component: NgiDatatableComponent;
  let fixture: ComponentFixture<NgiDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgiDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgiDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
