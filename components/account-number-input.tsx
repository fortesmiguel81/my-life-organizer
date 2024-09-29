import React, { useState } from "react";

import { Input } from "./ui/input";

type Props = {
  value: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function AccountNumberInput({
  value,
  onChange,
  disabled,
  placeholder,
}: Props) {
  const [error, setError] = useState<string | null>(null);

  // Helper function to format the account number input with spaces
  const formatAccountNumber = (input: string) => {
    // Extract the first two characters as the country code (retain alphabetic characters)
    const countryCode = input
      .substring(0, 2)
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase();

    // Allow only numeric characters after the first two characters
    const remainingInput = input.substring(2).replace(/\D/g, ""); // Keep only digits for the remaining input

    // Limit to a maximum of 23 characters for the remaining IBAN structure (excluding country code)
    const limitedInput = remainingInput.substring(0, 23);

    // Combine the country code and the cleaned/limited input
    const formatted = countryCode + limitedInput;

    // Insert spaces every 4 characters (skip first 2 characters for country code)
    return formatted.replace(/(.{4})/g, "$1 ").trim();
  };

  // Validate the IBAN structure based on the given rules
  const validateIBAN = (input: string): string | null => {
    // Remove spaces and uppercase the input to ensure consistent validation
    const cleanedInput = input.replace(/\s+/g, "").toUpperCase();

    // Rule 1: Country code – 2 letters (e.g., GB)
    const countryCode = cleanedInput.substring(0, 2);
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      return "Country code should consist of 2 uppercase letters (e.g., GB).";
    }

    // Rule 2: Check digits – 2 digits
    const checkDigits = cleanedInput.substring(2, 4);
    if (!/^\d{2}$/.test(checkDigits)) {
      return "Check digits should consist of 2 digits.";
    }

    // Rule 3: Bank code – 4 characters (alphanumeric)
    const bankCode = cleanedInput.substring(4, 8);
    if (!/^[A-Z0-9]{4}$/.test(bankCode)) {
      return "Bank code should be 4 alphanumeric characters.";
    }

    // Rule 4: Bank branch – 6 digits
    const bankBranch = cleanedInput.substring(8, 14);
    if (!/^\d{6}$/.test(bankBranch)) {
      return "Bank branch should be 6 digits.";
    }

    // Rule 5: Bank account number – 11 digits (Update from 8 digits to 11)
    const accountNumber = cleanedInput.substring(14, 25); // IBAN account number part (11 digits)
    if (!/^\d{11}$/.test(accountNumber)) {
      return "Account number should be 11 digits.";
    }

    return null; // No validation errors
  };

  // Handle input change and validate the value
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatAccountNumber(e.target.value);
    onChange(formattedValue);

    // Validate the formatted input
    const validationError = validateIBAN(formattedValue);
    setError(validationError);
  };

  return (
    <div>
      <Input
        type="text"
        value={value}
        disabled={disabled}
        onChange={handleChange}
        maxLength={31}
        placeholder={placeholder}
      />
      {error && <p className="mt-2 text-xs text-muted-foreground">{error}</p>}
    </div>
  );
}
