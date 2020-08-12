import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserViewComponent } from './import-user-view.component';

describe('ImportUserViewComponent', () => {
  let component: ImportUserViewComponent;
  let fixture: ComponentFixture<ImportUserViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
