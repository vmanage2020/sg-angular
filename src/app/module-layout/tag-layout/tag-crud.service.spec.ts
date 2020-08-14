import { TestBed } from '@angular/core/testing';

import { TagCrudService } from './tag-crud.service';

describe('TagCrudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TagCrudService = TestBed.get(TagCrudService);
    expect(service).toBeTruthy();
  });
});
