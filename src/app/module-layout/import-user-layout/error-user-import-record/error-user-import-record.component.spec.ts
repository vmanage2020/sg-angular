import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorUserImportRecordComponent } from './error-user-import-record.component';

describe('ErrorUserImportRecordComponent', () => {
  let component: ErrorUserImportRecordComponent;
  let fixture: ComponentFixture<ErrorUserImportRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorUserImportRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorUserImportRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
