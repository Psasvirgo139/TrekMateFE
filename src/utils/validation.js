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

  // Validate title
  if (data.hasOwnProperty('title')) {
    const val = data.title;
    if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
      errors.title = 'The tour name cannot be left blank..';
    }
  }

  // Validate startLocation
  if (data.hasOwnProperty('startLocation')) {
    const val = data.startLocation;
    if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
      errors.startLocation = 'The departure location cannot be left blank..';
    } else {
      // Regex matches letters (including accents), spaces, commas, periods, and hyphens.
      const locationRegex = /^[\p{L}\s,.-]+$/u;
      if (!locationRegex.test(val)) {
        errors.startLocation = 'The departure location can only contain letters, spaces, and punctuation marks (, . -).';
      }
    }
  }

  // Validate endLocation
  if (data.hasOwnProperty('endLocation')) {
    const val = data.endLocation;
    if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
      errors.endLocation = 'The end location cannot be left blank..';
    } else {
      const locationRegex = /^[\p{L}\s,.-]+$/u;
      if (!locationRegex.test(val)) {
        errors.endLocation = 'The end location can only contain letters, spaces, and punctuation marks (, . -).';
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
      errors.durationDays = 'The number of days is invalid.';
    } else if (days < 0) {
      errors.durationDays = 'The number of days cannot be less than 0.';
    }

    if (isNaN(nights)) {
      errors.durationNights = 'The number of nights is invalid.';
    } else if (nights < 0) {
      errors.durationNights = 'The number of nights cannot be less than 0.';
    }

    if (!isNaN(days) && days >= 0 && !isNaN(nights) && nights >= 0) {
      if (days === 0 && nights === 0) {
        errors.durationDays = 'The number of days and the number of nights cannot be zero at the same time.';
        errors.durationNights = 'The number of days and the number of nights cannot be zero at the same time.';
      } else if (Math.abs(days - nights) > 1) {
        const errorMsg = 'The difference between the number of days and the number of nights is only allowed to be 0 or 1 (Example: 3 days 2 nights, 2 days 2 nights, 2 days 3 nights).';
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
