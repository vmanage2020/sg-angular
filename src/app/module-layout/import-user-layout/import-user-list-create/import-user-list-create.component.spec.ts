import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserListCreateComponent } from './import-user-list-create.component';

describe('ImportUserListCreateComponent', () => {
  let component: ImportUserListCreateComponent;
  let fixture: ComponentFixture<ImportUserListCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserListCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserListCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
