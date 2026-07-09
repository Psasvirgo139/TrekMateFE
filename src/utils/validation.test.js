import { describe, it, expect } from 'vitest';
import { validateTourData, getValidNightsOptions } from './validation';

describe('validateTourData', () => {
  describe('Location Validation', () => {
    it('should return errors for blank startLocation or endLocation', () => {
      const errors = validateTourData({ startLocation: '', endLocation: '   ' });
      expect(errors.startLocation).toBe('Điểm xuất phát không được để trống.');
      expect(errors.endLocation).toBe('Điểm kết thúc không được để trống.');
    });

    it('should return errors for invalid characters in location names', () => {
      const errors = validateTourData({ 
        startLocation: 'Ha Noi @ 123', 
        endLocation: 'Sapa Town #$' 
      });
      expect(errors.startLocation).toBe('Điểm xuất phát chỉ được chứa chữ cái, khoảng trắng và các ký tự (, . -).');
      expect(errors.endLocation).toBe('Điểm kết thúc chỉ được chứa chữ cái, khoảng trắng và các ký tự (, . -).');
    });

    it('should pass for valid letters and Vietnamese punctuation', () => {
      const errors = validateTourData({ 
        startLocation: 'Hà Nội, Việt Nam', 
        endLocation: 'Sa Pa - Lào Cai' 
      });
      expect(errors.startLocation).toBeUndefined();
      expect(errors.endLocation).toBeUndefined();
    });
  });

  describe('Duration Validation', () => {
    it('should return errors for negative days or nights', () => {
      const errors = validateTourData({ durationDays: -1, durationNights: -2 });
      expect(errors.durationDays).toBe('Số ngày không được nhỏ hơn 0.');
      expect(errors.durationNights).toBe('Số đêm không được nhỏ hơn 0.');
    });

    it('should return error when both days and nights are zero', () => {
      const errors = validateTourData({ durationDays: 0, durationNights: 0 });
      expect(errors.durationDays).toBe('Số ngày và số đêm không thể đồng thời bằng 0.');
      expect(errors.durationNights).toBe('Số ngày và số đêm không thể đồng thời bằng 0.');
    });

    it('should return error when difference is greater than 1', () => {
      const errors = validateTourData({ durationDays: 4, durationNights: 2 });
      expect(errors.durationDays).toBe('Chênh lệch giữa số ngày và số đêm chỉ được phép là 0 hoặc 1 (Ví dụ: 3 ngày 2 đêm, 2 ngày 2 đêm, 2 ngày 3 đêm).');
      expect(errors.durationNights).toBe('Chênh lệch giữa số ngày và số đêm chỉ được phép là 0 hoặc 1 (Ví dụ: 3 ngày 2 đêm, 2 ngày 2 đêm, 2 ngày 3 đêm).');
    });

    it('should pass when difference is 0 or 1', () => {
      const errors1 = validateTourData({ durationDays: 3, durationNights: 2 });
      expect(errors1.durationDays).toBeUndefined();
      expect(errors1.durationNights).toBeUndefined();

      const errors2 = validateTourData({ durationDays: 2, durationNights: 2 });
      expect(errors2.durationDays).toBeUndefined();
      expect(errors2.durationNights).toBeUndefined();

      const errors3 = validateTourData({ durationDays: 2, durationNights: 3 });
      expect(errors3.durationDays).toBeUndefined();
      expect(errors3.durationNights).toBeUndefined();
    });
  });
});

describe('getValidNightsOptions', () => {
  it('should return correct options for days', () => {
    expect(getValidNightsOptions(1)).toEqual([0, 1, 2]);
    expect(getValidNightsOptions(2)).toEqual([1, 2, 3]);
    expect(getValidNightsOptions(3)).toEqual([2, 3, 4]);
  });

  it('should handle zero days correctly', () => {
    expect(getValidNightsOptions(0)).toEqual([0, 1]);
  });

  it('should return empty list for invalid input', () => {
    expect(getValidNightsOptions(-1)).toEqual([]);
    expect(getValidNightsOptions('abc')).toEqual([]);
  });
});
