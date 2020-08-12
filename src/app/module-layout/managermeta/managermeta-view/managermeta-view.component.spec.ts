import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagermetaViewComponent } from './managermeta-view.component';

describe('ManagermetaViewComponent', () => {
  let component: ManagermetaViewComponent;
  let fixture: ComponentFixture<ManagermetaViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagermetaViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagermetaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
