import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarCopyrightComponent } from './sidebar-copyright.component';

describe('SidebarCopyrightComponent', () => {
  let component: SidebarCopyrightComponent;
  let fixture: ComponentFixture<SidebarCopyrightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarCopyrightComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SidebarCopyrightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
