import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionGridComponent } from './position-grid.component';

describe('PositionGridComponent', () => {
  let component: PositionGridComponent;
  let fixture: ComponentFixture<PositionGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
