import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionListCreateComponent } from './position-list-create.component';

describe('PositionListCreateComponent', () => {
  let component: PositionListCreateComponent;
  let fixture: ComponentFixture<PositionListCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionListCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
