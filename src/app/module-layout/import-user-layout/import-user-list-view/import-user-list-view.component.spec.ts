import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserListViewComponent } from './import-user-list-view.component';

describe('ImportUserListViewComponent', () => {
  let component: ImportUserListViewComponent;
  let fixture: ComponentFixture<ImportUserListViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserListViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
