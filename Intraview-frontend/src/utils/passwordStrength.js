export const checkPasswordStrength = (password) => {
    let score = 0;

    if (!password) return { score: 0, label: "Weak" };

    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Convert score → label
    if (score <= 1) return { score, label: "Weak" };
    if (score === 2) return { score, label: "Medium" };
    if (score === 3) return { score, label: "Strong" };
    return { score, label: "Very Strong" };
};
