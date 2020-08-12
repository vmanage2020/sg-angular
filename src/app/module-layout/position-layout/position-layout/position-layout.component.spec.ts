import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionLayoutComponent } from './position-layout.component';

describe('PositionLayoutComponent', () => {
  let component: PositionLayoutComponent;
  let fixture: ComponentFixture<PositionLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PositionLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PositionLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
