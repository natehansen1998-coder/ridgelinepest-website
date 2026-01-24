/**
 * Ridgeline Pest Control - Main JavaScript
 * Handles mobile menu, form validation, Google Apps Script form submission, and smooth scrolling
 */

// =====================================================
// GOOGLE APPS SCRIPT CONFIGURATION
// =====================================================
// Replace this URL with your deployed Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwImg_EHVDP4-AvERUDYOKEAnBdETraT6YLfI86Yib4qQfbnTpmlMmEPiECR95ghBK_/exec';

// Debug logging
console.log('[Ridgeline] Script loaded');
console.log('[Ridgeline] Google Apps Script URL:', GOOGLE_APPS_SCRIPT_URL);

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
  // FORM VALIDATION AND GOOGLE APPS SCRIPT SUBMISSION
  // =====================================================
  const forms = document.querySelectorAll('form');
  console.log('[Ridgeline] Found ' + forms.length + ' forms on page');

  forms.forEach(function(form, index) {
    console.log('[Ridgeline] Attaching submit handler to form #' + index, form.id || 'no-id');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();

      console.log('[Ridgeline] ========== FORM SUBMIT DETECTED ==========');
      console.log('[Ridgeline] Form ID:', form.id || 'no-id');

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
        field.classList.remove('field-error');

        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('field-error');
          showFieldError(field, 'This field is required');
          if (!firstInvalidField) firstInvalidField = field;
          return;
        }

        if (field.type === 'email' && field.value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value)) {
            isValid = false;
            field.classList.add('field-error');
            showFieldError(field, 'Please enter a valid email address');
            if (!firstInvalidField) firstInvalidField = field;
          }
        }

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

      console.log('[Ridgeline] Form validation result:', isValid ? 'VALID' : 'INVALID');

      if (isValid) {
        console.log('[Ridgeline] Starting Google Apps Script submission...');
        submitToGoogleAppsScript(form);
      } else {
        console.log('[Ridgeline] Form invalid, not submitting');
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
        if (field.classList.contains('field-error')) {
          field.classList.remove('field-error');
          const errorMsg = field.parentElement.querySelector('.error-message');
          if (errorMsg) errorMsg.remove();
        }
      });
    });
  });

  // =====================================================
  // GOOGLE APPS SCRIPT FORM SUBMISSION
  // =====================================================
  function submitToGoogleAppsScript(form) {
    console.log('[Ridgeline] submitToGoogleAppsScript() called');

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

    // Show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Submitting...';
      submitBtn.style.opacity = '0.7';
    }

    // Collect and map form data
    const formData = collectAndMapFormData(form);
    console.log('[Ridgeline] Collected form data:', formData);

    // Add metadata
    formData.page_url = window.location.href;
    formData.page_title = document.title;
    formData.submitted_at = new Date().toISOString();

    console.log('[Ridgeline] Final payload:', JSON.stringify(formData, null, 2));
    console.log('[Ridgeline] Sending to:', GOOGLE_APPS_SCRIPT_URL);

    // Check if placeholder URL is still set
    if (GOOGLE_APPS_SCRIPT_URL === 'PLACEHOLDER_URL') {
      console.warn('[Ridgeline] WARNING: Google Apps Script URL is still set to placeholder!');
      console.warn('[Ridgeline] Please deploy your Google Apps Script and update the URL.');
      // Still show success for testing purposes
      showFormSuccess(form);
      return;
    }

    // Submit to Google Apps Script using fetch with no-cors mode
    fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Google Apps Script
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(function(response) {
      // With no-cors mode, we can't read the response
      // If fetch doesn't throw an error, assume success
      console.log('[Ridgeline] Fetch completed (no-cors mode - response not readable)');
      console.log('[Ridgeline] Assuming success since no error was thrown');
      showFormSuccess(form);
    })
    .catch(function(error) {
      console.error('[Ridgeline] Fetch error:', error);
      console.error('[Ridgeline] Error name:', error.name);
      console.error('[Ridgeline] Error message:', error.message);
      showFormError(form, submitBtn, originalBtnText);
    });
  }

  // =====================================================
  // COLLECT AND MAP FORM DATA
  // =====================================================
  function collectAndMapFormData(form) {
    const data = {};
    const inputs = form.querySelectorAll('input, select, textarea');

    // Field mapping: common variations → standardized names
    const fieldMappings = {
      // Name fields
      'name': 'name',
      'fullname': 'name',
      'full-name': 'name',
      'full_name': 'name',
      'your-name': 'name',
      'your_name': 'name',
      'contact-name': 'name',
      'contact_name': 'name',
      'sidebar-name': 'name',
      'sidebar_name': 'name',
      'firstname': 'name',
      'first-name': 'name',
      'first_name': 'name',

      // Phone fields
      'phone': 'phone',
      'telephone': 'phone',
      'tel': 'phone',
      'phone-number': 'phone',
      'phone_number': 'phone',
      'contact-phone': 'phone',
      'contact_phone': 'phone',
      'sidebar-phone': 'phone',
      'sidebar_phone': 'phone',

      // Email fields
      'email': 'email',
      'e-mail': 'email',
      'e_mail': 'email',
      'contact-email': 'email',
      'contact_email': 'email',
      'sidebar-email': 'email',
      'sidebar_email': 'email',

      // Address fields
      'address': 'address',
      'street-address': 'address',
      'street_address': 'address',
      'contact-address': 'address',
      'contact_address': 'address',
      'sidebar-address': 'address',
      'sidebar_address': 'address',

      // Zip code fields
      'zip': 'zip',
      'zipcode': 'zip',
      'zip-code': 'zip',
      'zip_code': 'zip',
      'postal-code': 'zip',
      'postal_code': 'zip',

      // Message/description fields
      'message': 'message',
      'comments': 'message',
      'comment': 'message',
      'description': 'message',
      'details': 'message',
      'contact-message': 'message',
      'contact_message': 'message',
      'sidebar-message': 'message',
      'sidebar_message': 'message',
      'pest-problem': 'message',
      'pest_problem': 'message',
      'pest_issues': 'message',
      'pest-issues': 'message',
      'sidebar-pest-issues': 'message',

      // Pest type fields (special handling - will be combined into message)
      'pest': 'pest_type',
      'pest-type': 'pest_type',
      'pest_type': 'pest_type',
      'contact-pest': 'pest_type',
      'contact_pest': 'pest_type',
      'sidebar-pest': 'pest_type',
      'sidebar_pest': 'pest_type',
      'ant_type': 'pest_type',
      'ant-type': 'pest_type',
      'sidebar-ant-type': 'pest_type',
      'spider_type': 'pest_type',
      'spider-type': 'pest_type',
      'sidebar-spider-type': 'pest_type',
      'rodent_type': 'pest_type',
      'rodent-type': 'pest_type',
      'sidebar-rodent-type': 'pest_type',

      // Location fields (where pest is seen)
      'location': 'location',
      'sidebar-location': 'location',
      'sidebar_location': 'location',

      // Service type fields
      'service': 'service_type',
      'service-type': 'service_type',
      'service_type': 'service_type',
      'sidebar-service': 'service_type',
      'sidebar_service': 'service_type'
    };

    inputs.forEach(function(input) {
      const fieldName = input.name || input.id;
      if (fieldName && input.value && input.value.trim()) {
        // Get the mapped field name or use original
        const mappedName = fieldMappings[fieldName.toLowerCase()] || fieldName;
        const value = input.value.trim();

        // If we already have this field, append to it (for combining pest info)
        if (data[mappedName]) {
          data[mappedName] = data[mappedName] + ' | ' + value;
        } else {
          data[mappedName] = value;
        }
      }
    });

    // Combine pest_type and location into message if they exist
    let combinedMessage = [];
    if (data.pest_type) {
      combinedMessage.push('Pest Type: ' + data.pest_type);
    }
    if (data.location) {
      combinedMessage.push('Location: ' + data.location);
    }
    if (data.service_type) {
      combinedMessage.push('Service: ' + data.service_type);
    }
    if (data.message) {
      combinedMessage.push(data.message);
    }

    if (combinedMessage.length > 0) {
      data.message = combinedMessage.join(' | ');
    }

    return data;
  }

  // =====================================================
  // SHOW FORM SUCCESS MESSAGE
  // =====================================================
  function showFormSuccess(form) {
    console.log('[Ridgeline] Showing success message');

    const successHTML =
      '<div class="form-success-message">' +
        '<div class="success-icon">&#10004;</div>' +
        '<h3>Thank You!</h3>' +
        '<p class="success-main">Your request has been submitted successfully.</p>' +
        '<p class="success-sub">We\'ll contact you within 30 minutes!</p>' +
        '<p class="success-phone">For immediate help, call:</p>' +
        '<a href="tel:+14353759148" class="btn btn-primary success-btn">' +
          '<span>&#128222;</span> (435) 375-9148' +
        '</a>' +
      '</div>';

    form.innerHTML = successHTML;
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // =====================================================
  // SHOW FORM ERROR MESSAGE
  // =====================================================
  function showFormError(form, submitBtn, originalBtnText) {
    console.log('[Ridgeline] Showing error message');

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
      submitBtn.style.opacity = '1';
    }

    var existingError = form.querySelector('.form-error-banner');
    if (existingError) {
      existingError.remove();
    }

    var errorBanner = document.createElement('div');
    errorBanner.className = 'form-error-banner';
    errorBanner.innerHTML =
      '<div class="error-icon">&#9888;</div>' +
      '<p class="error-main">Something went wrong.</p>' +
      '<p class="error-sub">Please call us at <a href="tel:+14353759148">(435) 375-9148</a></p>';

    form.insertBefore(errorBanner, form.firstChild);
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // =====================================================
  // SHOW FIELD ERROR
  // =====================================================
  function showFieldError(field, message) {
    var errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
  }

  // =====================================================
  // VALIDATE INDIVIDUAL FIELD
  // =====================================================
  function validateField(field) {
    field.classList.remove('field-error');
    var existingError = field.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();

    if (!field.required && !field.value) return true;

    if (field.required && !field.value.trim()) {
      field.classList.add('field-error');
      showFieldError(field, 'This field is required');
      return false;
    }

    if (field.type === 'email' && field.value) {
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        field.classList.add('field-error');
        showFieldError(field, 'Please enter a valid email address');
        return false;
      }
    }

    if (field.type === 'tel' && field.value) {
      var digitsOnly = field.value.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        field.classList.add('field-error');
        showFieldError(field, 'Please enter a valid phone number');
        return false;
      }
    }

    return true;
  }

  // =====================================================
  // PHONE NUMBER FORMATTING
  // =====================================================
  var phoneInputs = document.querySelectorAll('input[type="tel"]');

  phoneInputs.forEach(function(input) {
    input.addEventListener('input', function(e) {
      var value = e.target.value.replace(/\D/g, '');

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
  var header = document.querySelector('.header');

  window.addEventListener('scroll', function() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) {
      header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.15)';
    } else {
      header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
  });

  // =====================================================
  // ANIMATE ELEMENTS ON SCROLL
  // =====================================================
  var observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  var animateElements = document.querySelectorAll('.service-card, .testimonial-card, .why-item, .info-card, .process-step');
  animateElements.forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });

  console.log('[Ridgeline] Initialization complete');

});

// =====================================================
// INJECTED CSS FOR FORM VALIDATION AND SUCCESS/ERROR MESSAGES
// =====================================================
var formStyles = document.createElement('style');
formStyles.textContent =
  /* Field validation errors */
  '.field-error { border-color: #dc3545 !important; box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15) !important; }' +
  '.error-message { color: #dc3545; font-size: 0.85rem; margin-top: 0.25rem; }' +

  /* Success message styles */
  '.form-success-message { text-align: center; padding: 2rem 1rem; animation: fadeInUp 0.5s ease; }' +
  '.form-success-message .success-icon { font-size: 4rem; color: #2D5016; margin-bottom: 1rem; }' +
  '.form-success-message h3 { color: #2D5016; font-size: 1.75rem; margin-bottom: 0.5rem; }' +
  '.form-success-message .success-main { color: #333; font-size: 1.1rem; margin-bottom: 0.5rem; }' +
  '.form-success-message .success-sub { color: #666; margin-bottom: 1rem; }' +
  '.form-success-message .success-phone { color: #666; margin-bottom: 0.75rem; }' +
  '.form-success-message .success-btn { display: inline-flex; align-items: center; gap: 0.5rem; }' +

  /* Error banner styles */
  '.form-error-banner { background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; text-align: center; animation: fadeInUp 0.3s ease; }' +
  '.form-error-banner .error-icon { font-size: 2rem; color: #721c24; margin-bottom: 0.5rem; }' +
  '.form-error-banner .error-main { color: #721c24; font-weight: 600; margin: 0 0 0.25rem 0; }' +
  '.form-error-banner .error-sub { color: #721c24; margin: 0; }' +
  '.form-error-banner a { color: #721c24; font-weight: 600; text-decoration: underline; }' +

  /* Animations */
  '@keyframes fadeInUp { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }' +
  'button[type="submit"]:disabled { cursor: not-allowed; }';

document.head.appendChild(formStyles);
