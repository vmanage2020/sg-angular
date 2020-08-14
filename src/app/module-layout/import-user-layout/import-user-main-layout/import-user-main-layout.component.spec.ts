import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserMainLayoutComponent } from './import-user-main-layout.component';

describe('ImportUserMainLayoutComponent', () => {
  let component: ImportUserMainLayoutComponent;
  let fixture: ComponentFixture<ImportUserMainLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserMainLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserMainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
