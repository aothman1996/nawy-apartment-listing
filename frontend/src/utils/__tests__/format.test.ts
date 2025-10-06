import { formatPrice, formatArea } from '../format';

describe('format utilities', () => {
  describe('formatPrice', () => {
    it('should format price with commas', () => {
      expect(formatPrice(150000)).toBe('$150,000');
      expect(formatPrice(1000000)).toBe('$1,000,000');
      expect(formatPrice(50000)).toBe('$50,000');
    });

    it('should handle zero price', () => {
      expect(formatPrice(0)).toBe('$0');
    });

    it('should handle decimal prices by rounding', () => {
      expect(formatPrice(150000.50)).toBe('$150,001');
      expect(formatPrice(1000000.99)).toBe('$1,000,001');
    });

    it('should handle negative prices', () => {
      expect(formatPrice(-150000)).toBe('-$150,000');
    });
  });

  describe('formatArea', () => {
    it('should format area with sq ft suffix', () => {
      expect(formatArea(1200)).toBe('1,200 sq ft');
      expect(formatArea(50000)).toBe('50,000 sq ft');
      expect(formatArea(100)).toBe('100 sq ft');
    });

    it('should handle zero area', () => {
      expect(formatArea(0)).toBe('0 sq ft');
    });

    it('should handle decimal areas', () => {
      expect(formatArea(1200.5)).toBe('1,200.5 sq ft');
    });

    it('should handle negative areas', () => {
      expect(formatArea(-1200)).toBe('-1,200 sq ft');
    });
  });
});
