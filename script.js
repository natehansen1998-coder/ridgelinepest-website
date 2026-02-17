/**
 * Ridgeline Pest Control - Main JavaScript
 * Handles mobile menu, form submission to Formspree, and smooth scrolling
 */

// =====================================================
// FORMSPREE URL - Replace YOUR_FORM_ID with your actual Formspree form ID
// Get your form ID at https://formspree.io after creating an account
// =====================================================
const FORMSPREE_URL = 'https://formspree.io/f/xojnwkar';

console.log('[Ridgeline] Script loaded');
console.log('[Ridgeline] Forms will submit to Formspree');

document.addEventListener('DOMContentLoaded', function() {
  console.log('[Ridgeline] DOM loaded, initializing...');

  // =====================================================
  // MOBILE MENU TOGGLE
  // =====================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      mobileMenuBtn.setAttribute('aria-expanded', isExpanded);

      if (isExpanded) {
        mobileMenuBtn.innerHTML = '&#10005;';
      } else {
        mobileMenuBtn.innerHTML = '&#9776;';
      }
    });

    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        mobileMenuBtn.innerHTML = '&#9776;';
      });
    });

    document.addEventListener('click', function(event) {
      if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
        navMenu.classList.remove('active');
        mobileMenuBtn.innerHTML = '&#9776;';
      }
    });
  }

  // =====================================================
  // SMOOTH SCROLLING FOR ANCHOR LINKS
  // =====================================================
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      if (href === '#' || href === '') {
        return;
      }

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // =====================================================
  // FORM SUBMISSION TO FORMSPREE
  // =====================================================
  const forms = document.querySelectorAll('form');
  console.log('[Ridgeline] Found ' + forms.length + ' form(s) on this page');

  forms.forEach(function(form, index) {
    console.log('[Ridgeline] Attaching Formspree submit handler to form #' + index, form.id || '(no id)');

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();

      console.log('[Ridgeline] ========== FORM SUBMIT ==========');

      // Collect form data using FormData API
      const data = {};
      const formData = new FormData(form);

      for (let [key, value] of formData.entries()) {
        if (value && value.toString().trim()) {
          data[key] = value.toString().trim();
        }
      }

      // Add metadata
      data.page_url = window.location.href;
      data.page_title = document.title;
      data.submitted_at = new Date().toISOString();

      console.log('[Ridgeline] Form data to send:', data);

      // Get submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

      // Disable submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
        submitBtn.style.opacity = '0.7';
      }

      try {
        console.log('[Ridgeline] Sending to Formspree...');

        // Send to Formspree (proper CORS support, JSON format)
        const response = await fetch(FORMSPREE_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Form submission failed');
        }

        console.log('[Ridgeline] Form submitted successfully!');

        // Show success message
        form.innerHTML =
          '<div class="form-success-message">' +
            '<div class="success-icon">&#10004;</div>' +
            '<h3>Thank You!</h3>' +
            '<p class="success-main">Your request has been submitted successfully.</p>' +
            '<p class="success-sub">We\'ll contact you within 1 hour!</p>' +
            '<p class="success-phone">Need immediate help? Call:</p>' +
            '<a href="tel:+14353759148" class="btn btn-primary success-btn">' +
              '<span>&#128222;</span> (435) 375-9148' +
            '</a>' +
          '</div>';

        form.scrollIntoView({ behavior: 'smooth', block: 'center' });

      } catch (error) {
        console.error('[Ridgeline] Error:', error);

        // Show error message
        alert('Something went wrong. Please call us at (435) 375-9148');

        // Re-enable submit button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          submitBtn.style.opacity = '1';
        }
      }
    });
  });

  // =====================================================
  // PHONE NUMBER FORMATTING
  // =====================================================
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach(function(input) {
    input.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');

      if (value.length > 10) {
        value = value.slice(0, 10);
      }

      if (value.length > 0) {
        if (value.length <= 3) {
          value = '(' + value;
        } else if (value.length <= 6) {
          value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
        } else {
          value = '(' + value.slice(0, 3) + ') ' + value.slice(3, 6) + '-' + value.slice(6);
        }
      }

      e.target.value = value;
    });
  });

  // =====================================================
  // HEADER SCROLL EFFECT
  // =====================================================
  const header = document.querySelector('.header');

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) {
      header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    } else {
      header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
  });

  // =====================================================
  // ANIMATE ELEMENTS ON SCROLL
  // =====================================================
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll('.service-card, .testimonial-card, .why-item, .info-card, .process-step');
  animateElements.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });

  console.log('[Ridgeline] Initialization complete - all forms connected to Formspree');
});

// =====================================================
// CSS FOR FORM SUCCESS MESSAGE
// =====================================================
const formStyles = document.createElement('style');
formStyles.textContent =
  '.form-success-message { text-align: center; padding: 2rem 1rem; animation: fadeInUp 0.5s ease; background: linear-gradient(135deg, #2D5016 0%, #3d6b1e 100%); border-radius: 8px; color: white; }' +
  '.form-success-message .success-icon { font-size: 3rem; margin-bottom: 0.5rem; }' +
  '.form-success-message h3 { color: white; font-size: 1.5rem; margin-bottom: 0.5rem; }' +
  '.form-success-message .success-main { color: rgba(255,255,255,0.95); font-size: 1rem; margin-bottom: 0.25rem; }' +
  '.form-success-message .success-sub { color: rgba(255,255,255,0.85); margin-bottom: 0.75rem; }' +
  '.form-success-message .success-phone { color: rgba(255,255,255,0.85); margin-bottom: 0.5rem; font-size: 0.9rem; }' +
  '.form-success-message .success-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #E67E42; color: white; padding: 0.75rem 1.5rem; border-radius: 5px; text-decoration: none; font-weight: bold; }' +
  '.form-success-message .success-btn:hover { background: #d06a2f; }' +
  '@keyframes fadeInUp { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }';

document.head.appendChild(formStyles);
