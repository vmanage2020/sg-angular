import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessUserImportRecordComponent } from './success-user-import-record.component';

describe('SuccessUserImportRecordComponent', () => {
  let component: SuccessUserImportRecordComponent;
  let fixture: ComponentFixture<SuccessUserImportRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuccessUserImportRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuccessUserImportRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
