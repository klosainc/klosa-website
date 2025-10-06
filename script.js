// Klosa Landing Page JavaScript

// Modal functionality
const modal = document.getElementById('waitlistModal');
const waitlistBtns = document.querySelectorAll('.waitlist-btn');
const closeBtn = document.querySelector('.modal-close');
const waitlistForm = document.getElementById('waitlistForm');
const successMessage = document.getElementById('successMessage');

// Open modal when any waitlist button is clicked
waitlistBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
});

// Close modal when X is clicked
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Helper: Generate unique referral code
function generateReferralCode(name) {
    const prefix = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'KLOS');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${random}`;
}

// Helper: Get URL parameter for referrals
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Helper: Validate email format
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Handle form submission
waitlistForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = waitlistForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    // Disable button and show loading
    submitButton.disabled = true;
    submitButton.textContent = 'Joining...';

    const formData = new FormData(waitlistForm);

    // Collect data
    const data = {
        email: formData.get('email').trim().toLowerCase(),
        name: formData.get('name').trim(),
        phone: formData.get('phone')?.trim() || null,
        country: formData.get('country')?.trim() || null,
        source: 'website',
        referral_code: generateReferralCode(formData.get('name')),
        referred_by: getUrlParameter('ref'), // Check for ?ref= in URL
        user_agent: navigator.userAgent,
    };

    // Validate email
    if (!isValidEmail(data.email)) {
        alert('Please enter a valid email address');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        return;
    }

    try {
        // Insert into Supabase
        const { data: result, error } = await supabaseClient
            .from('waitlist')
            .insert([data])
            .select();

        if (error) {
            // Handle specific errors
            if (error.code === '23505') {
                // Unique constraint violation (duplicate email)
                throw new Error('This email is already on the waitlist! 🎉');
            }
            throw error;
        }

        console.log('✅ Waitlist signup successful:', result);

        // Success! Show success message
        waitlistForm.style.display = 'none';
        successMessage.style.display = 'block';

        // Reset form and close modal after 3 seconds
        setTimeout(() => {
            waitlistForm.reset();
            waitlistForm.style.display = 'flex';
            successMessage.style.display = 'none';
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 3000);

    } catch (error) {
        console.error('❌ Error submitting to waitlist:', error);

        // Show user-friendly error
        alert(error.message || 'Sorry, something went wrong. Please try again.');

        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        header.style.boxShadow = 'none';
    } else {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and steps
document.querySelectorAll('.feature-card, .step, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Phone screenshot rotation
const phoneScreenshots = document.querySelectorAll('.phone-screenshot');
let currentScreenshot = 0;

function rotateScreenshots() {
    phoneScreenshots.forEach(img => img.classList.remove('active'));
    currentScreenshot = (currentScreenshot + 1) % phoneScreenshots.length;
    phoneScreenshots[currentScreenshot].classList.add('active');
}

// Rotate every 4 seconds
setInterval(rotateScreenshots, 4000);

// Console message
console.log('%cKlosa', 'color: #14B8A6; font-size: 2rem; font-weight: bold;');
console.log('%cHow the diaspora supports their families back home', 'color: #94A3B8; font-size: 1rem;');
console.log('\n👋 Interested in joining our team? Email: hello@klosa.app');
