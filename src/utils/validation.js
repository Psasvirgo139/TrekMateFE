/**
 * Validates Tour basic information including locations and duration (days & nights).
 * 
 * Rules:
 * 1. Location (start & end): Not blank, only letters (including Unicode/Vietnamese), spaces, and basic punctuation (, . -).
 * 2. Days & Nights:
 *    - Must be >= 0.
 *    - Both cannot be 0 at the same time.
 *    - The absolute difference between Days and Nights must be 0 or 1.
 */
export const validateTourData = (data) => {
  const errors = {};

  // Validate startLocation
  if (data.hasOwnProperty('startLocation')) {
    const val = data.startLocation;
    if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
      errors.startLocation = 'Điểm xuất phát không được để trống.';
    } else {
      // Regex matches letters (including accents), spaces, commas, periods, and hyphens.
      const locationRegex = /^[\p{L}\s,.-]+$/u;
      if (!locationRegex.test(val)) {
        errors.startLocation = 'Điểm xuất phát chỉ được chứa chữ cái, khoảng trắng và các ký tự (, . -).';
      }
    }
  }

  // Validate endLocation
  if (data.hasOwnProperty('endLocation')) {
    const val = data.endLocation;
    if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
      errors.endLocation = 'Điểm kết thúc không được để trống.';
    } else {
      const locationRegex = /^[\p{L}\s,.-]+$/u;
      if (!locationRegex.test(val)) {
        errors.endLocation = 'Điểm kết thúc chỉ được chứa chữ cái, khoảng trắng và các ký tự (, . -).';
      }
    }
  }

  // Validate durationDays & durationNights
  if (data.hasOwnProperty('durationDays') || data.hasOwnProperty('durationNights')) {
    const daysVal = data.durationDays;
    const nightsVal = data.durationNights;

    const days = (daysVal === '' || daysVal === undefined || daysVal === null) ? NaN : Number(daysVal);
    const nights = (nightsVal === '' || nightsVal === undefined || nightsVal === null) ? NaN : Number(nightsVal);

    if (isNaN(days)) {
      errors.durationDays = 'Số ngày không hợp lệ.';
    } else if (days < 0) {
      errors.durationDays = 'Số ngày không được nhỏ hơn 0.';
    }

    if (isNaN(nights)) {
      errors.durationNights = 'Số đêm không hợp lệ.';
    } else if (nights < 0) {
      errors.durationNights = 'Số đêm không được nhỏ hơn 0.';
    }

    if (!isNaN(days) && days >= 0 && !isNaN(nights) && nights >= 0) {
      if (days === 0 && nights === 0) {
        errors.durationDays = 'Số ngày và số đêm không thể đồng thời bằng 0.';
        errors.durationNights = 'Số ngày và số đêm không thể đồng thời bằng 0.';
      } else if (Math.abs(days - nights) > 1) {
        const errorMsg = 'Chênh lệch giữa số ngày và số đêm chỉ được phép là 0 hoặc 1 (Ví dụ: 3 ngày 2 đêm, 2 ngày 2 đêm, 2 ngày 3 đêm).';
        errors.durationDays = errorMsg;
        errors.durationNights = errorMsg;
      }
    }
  }

  return errors;
};

/**
 * Returns the list of valid nights options given a number of days.
 * Used for dynamic dropdown selection.
 */
export const getValidNightsOptions = (days) => {
  const d = parseInt(days);
  if (isNaN(d) || d < 0) return [];
  const options = [];
  if (d - 1 >= 0) {
    options.push(d - 1);
  }
  options.push(d);
  options.push(d + 1);
  return options;
};
