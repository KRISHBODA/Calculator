/**
 * Tax & Retirement Configurable Dataset (Updated for current tax laws)
 */

export const TAX_BRACKETS_2024 = {
  single: [
    { threshold: 11600, rate: 10 },
    { threshold: 47150, rate: 12 },
    { threshold: 100525, rate: 22 },
    { threshold: 191950, rate: 24 },
    { threshold: 243725, rate: 32 },
    { threshold: 609350, rate: 35 },
    { threshold: Infinity, rate: 37 }
  ],
  marriedJoint: [
    { threshold: 23200, rate: 10 },
    { threshold: 94300, rate: 12 },
    { threshold: 201050, rate: 22 },
    { threshold: 383900, rate: 24 },
    { threshold: 487450, rate: 32 },
    { threshold: 731200, rate: 35 },
    { threshold: Infinity, rate: 37 }
  ]
};

export const STANDARD_DEDUCTION_2024 = {
  single: 14600,
  marriedJoint: 29200
};

export const FICA_RATES = {
  socialSecurityRate: 0.062,
  socialSecurityCap: 168600,
  medicareRate: 0.0145
};

// IRS Uniform Lifetime Table for RMD (Required Minimum Distribution)
export const IRS_UNIFORM_LIFETIME_TABLE = {
  73: 26.5,
  74: 25.5,
  75: 24.6,
  76: 23.7,
  77: 22.9,
  78: 22.0,
  79: 21.1,
  80: 20.2,
  81: 19.4,
  82: 18.5,
  83: 17.7,
  84: 16.8,
  85: 16.0,
  86: 15.2,
  87: 14.4,
  88: 13.7,
  89: 12.9,
  90: 12.2,
  91: 11.5,
  92: 10.8,
  93: 10.1,
  94: 9.5,
  95: 8.9,
  96: 8.4,
  97: 7.8,
  98: 7.3,
  99: 6.8,
  100: 6.4
};
