import RememberMe from '../utils/rememberMe.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const emailInput = document.getElementById('email');
    const rememberCheckbox = document.getElementById('remember');

    // Auto-fill form if credentials exist
    RememberMe.autoFillForm(emailInput, passwordInput, rememberCheckbox);

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = emailInput.value;
        const password = passwordInput.value;
        const remember = rememberCheckbox.checked;

        // Handle remember me
        if (remember) {
            RememberMe.saveCredentials(email, password);
        } else {
            RememberMe.clearCredentials();
        }

        // Add loading state to button
        const loginBtn = document.querySelector('.login-btn');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Here you would typically make an API call to your backend
            console.log('Login attempt:', { email, password, remember });
            
            // Reset button state
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;

            // Show success message (you can replace this with actual authentication logic)
            alert('Login successful!');
        }, 1500);
    });

    // Social login buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.classList.contains('google') ? 'Google' : 'Facebook';
            alert(`${provider} login feature will be added soon! Stay tuned for updates.`);
        });
    });

    // Add input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });

    // Add smooth hover effects
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseout', () => {
            button.style.transform = 'translateY(0)';
        });
    });
}); 