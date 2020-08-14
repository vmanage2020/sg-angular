import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponseLayoutComponent } from './canned-response-layout.component';

describe('CannedResponseLayoutComponent', () => {
  let component: CannedResponseLayoutComponent;
  let fixture: ComponentFixture<CannedResponseLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponseLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
