import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagermetadataComponent } from './managermetadata.component';

describe('ManagermetadataComponent', () => {
  let component: ManagermetadataComponent;
  let fixture: ComponentFixture<ManagermetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagermetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagermetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
