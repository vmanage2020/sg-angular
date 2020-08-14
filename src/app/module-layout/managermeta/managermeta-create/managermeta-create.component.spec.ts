import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagermetaCreateComponent } from './managermeta-create.component';

describe('ManagermetaCreateComponent', () => {
  let component: ManagermetaCreateComponent;
  let fixture: ComponentFixture<ManagermetaCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagermetaCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagermetaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
