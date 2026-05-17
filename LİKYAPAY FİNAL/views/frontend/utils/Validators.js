// Validation Utilities
// Path: views/frontend/utils/Validators.js

window.Validators = {
    // TR IBAN: TR + 24 digits (Total 26 chars)
    isValidIBAN: (iban) => {
        if (!iban) return false;
        // Remove spaces and make uppercase
        const cleanIBAN = iban.replace(/\s+/g, '').toUpperCase();

        // Basic Length & Prefix Check
        if (cleanIBAN.length !== 26) return false;
        if (!cleanIBAN.startsWith('TR')) return false;

        // Numeric check for the last 24 characters
        const body = cleanIBAN.slice(2);
        if (!/^\d+$/.test(body)) return false;

        return true;
    },

    formatIBAN: (iban) => {
        if (!iban) return '';
        const clean = iban.replace(/\s+/g, '').toUpperCase();
        // Add space every 4 characters
        return clean.replace(/(.{4})/g, '$1 ').trim();
    },

    // TCKN: 11 Digits, Numeric
    isValidTCKN: (tckn) => {
        if (!tckn) return false;
        const clean = tckn.toString();

        if (clean.length !== 11) return false;
        if (!/^\d+$/.test(clean)) return false;

        // Algorithmic Check (Optional/Advanced)
        // For now, strict 11 digit check is requested as baseline
        return true;
    },

    // VKN: 10 Digits, Numeric
    isValidVKN: (vkn) => {
        if (!vkn) return false;
        const clean = vkn.toString();

        if (clean.length !== 10) return false;
        if (!/^\d+$/.test(clean)) return false;

        return true;
    },

    // Generic Tax ID Check (Either VKN or TCKN)
    isValidTaxID: (id) => {
        return window.Validators.isValidTCKN(id) || window.Validators.isValidVKN(id);
    }
};
