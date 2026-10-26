import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardDesktopComponent } from './product-card/product-card-desktop.component';

describe('ProductCardDesktopComponent', () => {
  let fixture: ComponentFixture<ProductCardDesktopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardDesktopComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardDesktopComponent);
    fixture.componentRef.setInput('name', '10×42 binoculars');
    fixture.componentRef.setInput('price', 'R 8 450');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
