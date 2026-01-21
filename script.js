/**
 * Ridgeline Pest Control - Main JavaScript
 * Handles mobile menu, form validation, and smooth scrolling
 */

document.addEventListener('DOMContentLoaded', function() {

  // =====================================================
  // MOBILE MENU TOGGLE
  // =====================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      navMenu.classList.toggle('active');
      // Update aria-expanded for accessibility
      const isExpanded = navMenu.classList.contains('active');
      mobileMenuBtn.setAttribute('aria-expanded', isExpanded);

      // Change menu icon
      if (isExpanded) {
        mobileMenuBtn.innerHTML = '&#10005;'; // X icon
      } else {
        mobileMenuBtn.innerHTML = '&#9776;'; // Hamburger icon
      }
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        mobileMenuBtn.innerHTML = '&#9776;';
      });
    });

    // Close menu when clicking outside
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

      // Skip if it's just "#" or empty
      if (href === '#' || href === '') {
        return;
      }

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        // Calculate offset for sticky header
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
  // FORM VALIDATION
  // =====================================================
  const forms = document.querySelectorAll('form');

  forms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      // Get all required fields
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      let firstInvalidField = null;

      // Remove existing error messages
      form.querySelectorAll('.error-message').forEach(function(msg) {
        msg.remove();
      });

      // Validate each required field
      requiredFields.forEach(function(field) {
        // Remove existing error styling
        field.classList.remove('field-error');

        // Check if field is empty
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('field-error');
          showFieldError(field, 'This field is required');
          if (!firstInvalidField) firstInvalidField = field;
          return;
        }

        // Validate email
        if (field.type === 'email' && field.value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value)) {
            isValid = false;
            field.classList.add('field-error');
            showFieldError(field, 'Please enter a valid email address');
            if (!firstInvalidField) firstInvalidField = field;
          }
        }

        // Validate phone
        if (field.type === 'tel' && field.value) {
          const phoneRegex = /^[\d\s\-\(\)]+$/;
          const digitsOnly = field.value.replace(/\D/g, '');
          if (!phoneRegex.test(field.value) || digitsOnly.length < 10) {
            isValid = false;
            field.classList.add('field-error');
            showFieldError(field, 'Please enter a valid phone number');
            if (!firstInvalidField) firstInvalidField = field;
          }
        }

        // Validate zip code
        if (field.name === 'zip' && field.value) {
          const zipRegex = /^\d{5}$/;
          if (!zipRegex.test(field.value)) {
            isValid = false;
            field.classList.add('field-error');
            showFieldError(field, 'Please enter a valid 5-digit zip code');
            if (!firstInvalidField) firstInvalidField = field;
          }
        }
      });

      // If form is valid, show success message
      if (isValid) {
        showFormSuccess(form);
      } else {
        // Focus on first invalid field
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
      }
    });

    // Real-time validation on input
    form.querySelectorAll('input, select, textarea').forEach(function(field) {
      field.addEventListener('blur', function() {
        validateField(field);
      });

      field.addEventListener('input', function() {
        // Remove error styling on input
        if (field.classList.contains('field-error')) {
          field.classList.remove('field-error');
          const errorMsg = field.parentElement.querySelector('.error-message');
          if (errorMsg) errorMsg.remove();
        }
      });
    });
  });

  function showFieldError(field, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
  }

  function validateField(field) {
    // Remove existing error
    field.classList.remove('field-error');
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();

    // Skip validation if not required and empty
    if (!field.required && !field.value) return true;

    // Required field check
    if (field.required && !field.value.trim()) {
      field.classList.add('field-error');
      showFieldError(field, 'This field is required');
      return false;
    }

    // Email validation
    if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        field.classList.add('field-error');
        showFieldError(field, 'Please enter a valid email address');
        return false;
      }
    }

    // Phone validation
    if (field.type === 'tel' && field.value) {
      const digitsOnly = field.value.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        field.classList.add('field-error');
        showFieldError(field, 'Please enter a valid phone number');
        return false;
      }
    }

    return true;
  }

  function showFormSuccess(form) {
    // Hide the form
    const formContent = form.innerHTML;

    // Create success message
    const successHTML = `
      <div class="form-success" style="text-align: center; padding: 2rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem; color: #2D5016;">&#10004;</div>
        <h3 style="margin-bottom: 0.5rem; color: #2D5016;">Thank You!</h3>
        <p style="margin-bottom: 1rem;">Your request has been submitted successfully.</p>
        <p style="margin-bottom: 1.5rem; color: #666;">We'll contact you within 1 business hour.</p>
        <p style="font-weight: 600;">Need immediate help?</p>
        <a href="tel:+14353759148" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
          <span>&#128222;</span> Call (435) 375-9148
        </a>
      </div>
    `;

    form.innerHTML = successHTML;

    // Scroll to success message
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // =====================================================
  // PHONE NUMBER FORMATTING
  // =====================================================
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach(function(input) {
    input.addEventListener('input', function(e) {
      // Get only digits
      let value = e.target.value.replace(/\D/g, '');

      // Limit to 10 digits
      if (value.length > 10) {
        value = value.slice(0, 10);
      }

      // Format as (XXX) XXX-XXXX
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
  let lastScrollTop = 0;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add shadow on scroll
    if (scrollTop > 50) {
      header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    } else {
      header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }

    lastScrollTop = scrollTop;
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

  // Observe service cards, testimonials, etc.
  const animateElements = document.querySelectorAll('.service-card, .testimonial-card, .why-item, .info-card, .process-step');
  animateElements.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });

  // =====================================================
  // CLICK TRACKING FOR ANALYTICS (placeholder)
  // =====================================================
  const ctaButtons = document.querySelectorAll('.btn-primary, .hero-phone, .header-phone, .mobile-sticky-cta a');

  ctaButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      // Placeholder for analytics tracking
      // You can integrate Google Analytics, Facebook Pixel, etc.
      const buttonText = this.textContent.trim();
      const buttonHref = this.getAttribute('href') || 'form-submit';

      // Console log for debugging - remove in production
      // console.log('CTA Clicked:', buttonText, buttonHref);

      // Example: Google Analytics event tracking
      // if (typeof gtag !== 'undefined') {
      //   gtag('event', 'click', {
      //     'event_category': 'CTA',
      //     'event_label': buttonText,
      //     'value': buttonHref
      //   });
      // }
    });
  });

  // =====================================================
  // LAZY LOAD IMAGES (if any are added later)
  // =====================================================
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(function(img) {
      img.src = img.dataset.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }

});

// =====================================================
// ADDITIONAL CSS FOR FORM VALIDATION (injected)
// =====================================================
const validationStyles = document.createElement('style');
validationStyles.textContent = `
  .field-error {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15) !important;
  }

  .form-success {
    animation: fadeIn 0.5s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(validationStyles);
