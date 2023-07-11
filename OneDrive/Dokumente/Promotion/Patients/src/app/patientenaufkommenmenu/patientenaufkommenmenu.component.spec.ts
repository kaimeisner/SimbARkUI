import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientenaufkommenmenuComponent } from './patientenaufkommenmenu.component';

describe('PatientenaufkommenmenuComponent', () => {
  let component: PatientenaufkommenmenuComponent;
  let fixture: ComponentFixture<PatientenaufkommenmenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientenaufkommenmenuComponent]
    });
    fixture = TestBed.createComponent(PatientenaufkommenmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
