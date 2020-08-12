import { TestBed } from '@angular/core/testing';

import { OrganizationCrudService } from './organization-crud.service';

describe('OrganizationCrudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrganizationCrudService = TestBed.get(OrganizationCrudService);
    expect(service).toBeTruthy();
  });
});
