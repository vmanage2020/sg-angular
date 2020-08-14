import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionListEditComponent } from './position-list-edit.component';

describe('PositionListEditComponent', () => {
  let component: PositionListEditComponent;
  let fixture: ComponentFixture<PositionListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
