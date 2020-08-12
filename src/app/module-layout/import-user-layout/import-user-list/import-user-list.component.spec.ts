import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserListComponent } from './import-user-list.component';

describe('ImportUserListComponent', () => {
  let component: ImportUserListComponent;
  let fixture: ComponentFixture<ImportUserListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
