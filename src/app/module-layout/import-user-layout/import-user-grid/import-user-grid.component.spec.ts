import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportUserGridComponent } from './import-user-grid.component';

describe('ImportUserGridComponent', () => {
  let component: ImportUserGridComponent;
  let fixture: ComponentFixture<ImportUserGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportUserGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUserGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
