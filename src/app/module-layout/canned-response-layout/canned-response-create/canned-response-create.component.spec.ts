import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponseCreateComponent } from './canned-response-create.component';

describe('CannedResponseCreateComponent', () => {
  let component: CannedResponseCreateComponent;
  let fixture: ComponentFixture<CannedResponseCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponseCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
