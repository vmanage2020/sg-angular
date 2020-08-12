import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserImportRecordComponent } from './update-user-import-record.component';

describe('UpdateUserImportRecordComponent', () => {
  let component: UpdateUserImportRecordComponent;
  let fixture: ComponentFixture<UpdateUserImportRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateUserImportRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateUserImportRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
