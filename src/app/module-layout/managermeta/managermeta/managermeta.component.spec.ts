import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagermetaComponent } from './managermeta.component';

describe('ManagermetaComponent', () => {
  let component: ManagermetaComponent;
  let fixture: ComponentFixture<ManagermetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagermetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagermetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
