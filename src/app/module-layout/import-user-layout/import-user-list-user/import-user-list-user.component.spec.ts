import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserListUserComponent } from './import-user-list-user.component';

describe('ImportUserListUserComponent', () => {
  let component: ImportUserListUserComponent;
  let fixture: ComponentFixture<ImportUserListUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserListUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserListUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
