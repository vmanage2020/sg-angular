import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserListEditComponent } from './import-user-list-edit.component';

describe('ImportUserListEditComponent', () => {
  let component: ImportUserListEditComponent;
  let fixture: ComponentFixture<ImportUserListEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserListEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserListEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
