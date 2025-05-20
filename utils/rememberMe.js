// Remember Me functionality
class RememberMe {
    static STORAGE_KEY = 'user_credentials';

    // Save user credentials
    static saveCredentials(email, password) {
        const credentials = {
            email,
            password,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
    }

    // Get saved credentials
    static getCredentials() {
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData);
        }
        return null;
    }

    // Check if credentials exist
    static hasCredentials() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }

    // Clear saved credentials
    static clearCredentials() {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    // Auto-fill form with saved credentials
    static autoFillForm(emailInput, passwordInput, rememberCheckbox) {
        const credentials = this.getCredentials();
        if (credentials) {
            emailInput.value = credentials.email;
            passwordInput.value = credentials.password;
            rememberCheckbox.checked = true;
        }
    }
}

// Export the RememberMe class
export default RememberMe; 