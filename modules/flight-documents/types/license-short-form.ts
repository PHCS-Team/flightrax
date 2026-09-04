// A license reduced to what prints on the form: "123456-CPL | C152/IR | 15 MAR '25".
export type LicenseShortForm = {
  licenseNumber: string;
  licenseTypeAbbreviation: string;
  ratingAbbreviations: string[];
  expiryDate: string | null;
  hasNoExpiry: boolean;
};

// The stored shape both the filer context and the plan snapshot share.
export type LicenseShortFormSource = {
  licenseType: string;
  licenseNumber: string;
  ratings: string[];
  expiryDate: string | null;
  hasNoExpiry: boolean;
};
