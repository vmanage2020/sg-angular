import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserCreateComponent } from './import-user-create.component';

describe('ImportUserCreateComponent', () => {
  let component: ImportUserCreateComponent;
  let fixture: ComponentFixture<ImportUserCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
