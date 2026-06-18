export const checkPasswordStrength = (password) => {
    if (!password) {
        return {
            score: 0,
            label: "Weak",
            checks: {
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false,
            }
        };
    }

    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    let score = Object.values(checks).filter(Boolean).length;

    let label = "Weak";
    if (score >= 4 && checks.length) {
        label = score === 5 ? "Strong" : "Good";
    } else if (score >= 2) {
        label = "Fair";
    }

    // Cap score at 4 for the bar width calculation in the component
    const normalizedScore = score > 4 ? 4 : score;

    return { score: normalizedScore, label, checks };
};
