/**
 * Ridgeline Pest Control - Main JavaScript
 * Handles mobile menu, form validation, HubSpot integration, and smooth scrolling
 */

// HubSpot Configuration
const HUBSPOT_CONFIG = {
  portalId: '244959501',
  formGuid: '8e4e4678-8d1a-4179-8859-0f593279e237',
  region: 'na1'
};

const HUBSPOT_ENDPOINT = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_CONFIG.portalId}/${HUBSPOT_CONFIG.formGuid}`;

// Debug logging
console.log('[Ridgeline] Script loaded');
console.log('[Ridgeline] HubSpot endpoint:', HUBSPOT_ENDPOINT);

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
  // FORM VALIDATION AND HUBSPOT SUBMISSION
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
      console.log('[Ridgeline] Form action:', form.action);

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
        console.log('[Ridgeline] Starting HubSpot submission...');
        submitToHubSpot(form);
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
  // HUBSPOT FORM SUBMISSION
  // =====================================================
  function submitToHubSpot(form) {
    console.log('[Ridgeline] submitToHubSpot() called');

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

    // Show loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Submitting...';
      submitBtn.style.opacity = '0.7';
    }

    // Collect form data
    const formData = collectFormData(form);
    console.log('[Ridgeline] Collected form data:', formData);

    // Build HubSpot fields array
    const hubspotFields = buildHubSpotFields(formData);
    console.log('[Ridgeline] HubSpot fields:', hubspotFields);

    // Prepare the submission payload
    const payload = {
      fields: hubspotFields,
      context: {
        pageUri: window.location.href,
        pageName: document.title
      }
    };

    console.log('[Ridgeline] Full payload:', JSON.stringify(payload, null, 2));
    console.log('[Ridgeline] Sending to:', HUBSPOT_ENDPOINT);

    // Submit to HubSpot using fetch
    fetch(HUBSPOT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function(response) {
      console.log('[Ridgeline] HubSpot response status:', response.status);
      console.log('[Ridgeline] HubSpot response ok:', response.ok);

      if (response.ok) {
        return response.json().then(function(data) {
          console.log('[Ridgeline] HubSpot SUCCESS response:', data);
          showFormSuccess(form);
        });
      } else {
        return response.text().then(function(text) {
          console.error('[Ridgeline] HubSpot ERROR response:', text);
          showFormError(form, submitBtn, originalBtnText);
        });
      }
    })
    .catch(function(error) {
      console.error('[Ridgeline] Fetch error:', error);
      console.error('[Ridgeline] Error name:', error.name);
      console.error('[Ridgeline] Error message:', error.message);
      showFormError(form, submitBtn, originalBtnText);
    });
  }

  // =====================================================
  // COLLECT FORM DATA
  // =====================================================
  function collectFormData(form) {
    const data = {};
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(function(input) {
      const name = input.name || input.id;
      if (name && input.value) {
        data[name] = input.value.trim();
      }
    });

    return data;
  }

  // =====================================================
  // BUILD HUBSPOT FIELDS ARRAY
  // =====================================================
  function buildHubSpotFields(formData) {
    const fields = [];

    // Map form fields to HubSpot properties
    const fieldMappings = {
      'name': 'firstname',
      'contact-name': 'firstname',
      'sidebar-name': 'firstname',
      'firstname': 'firstname',
      'first_name': 'firstname',
      'phone': 'phone',
      'contact-phone': 'phone',
      'sidebar-phone': 'phone',
      'telephone': 'phone',
      'email': 'email',
      'contact-email': 'email',
      'sidebar-email': 'email',
      'address': 'address',
      'contact-address': 'address',
      'sidebar-address': 'address',
      'zip': 'zip',
      'zipcode': 'zip',
      'postal_code': 'zip',
      'message': 'message',
      'contact-message': 'message',
      'sidebar-message': 'message',
      'pest': 'message',
      'contact-pest': 'message',
      'sidebar-pest': 'message',
      'pest_issues': 'message',
      'location': 'message',
      'sidebar-location': 'message',
      'company': 'company',
      'sidebar-company': 'company',
      'business_type': 'message',
      'sidebar-type': 'message',
      'service': 'message',
      'sidebar-service': 'message',
      'ant_type': 'message',
      'sidebar-ant-type': 'message',
      'spider_type': 'message',
      'sidebar-spider-type': 'message',
      'rodent_type': 'message',
      'sidebar-rodent-type': 'message'
    };

    const addedFields = {};

    for (const formField in formData) {
      if (formData.hasOwnProperty(formField)) {
        const value = formData[formField];
        const hubspotField = fieldMappings[formField];

        if (hubspotField) {
          if (hubspotField === 'message') {
            if (addedFields['message']) {
              for (var i = 0; i < fields.length; i++) {
                if (fields[i].name === 'message') {
                  fields[i].value += ' | ' + value;
                  break;
                }
              }
            } else {
              fields.push({
                objectTypeId: '0-1',
                name: 'message',
                value: value
              });
              addedFields['message'] = true;
            }
          } else if (!addedFields[hubspotField]) {
            if (hubspotField === 'firstname' && value.indexOf(' ') !== -1) {
              const nameParts = value.split(' ');
              fields.push({
                objectTypeId: '0-1',
                name: 'firstname',
                value: nameParts[0]
              });
              fields.push({
                objectTypeId: '0-1',
                name: 'lastname',
                value: nameParts.slice(1).join(' ')
              });
              addedFields['firstname'] = true;
              addedFields['lastname'] = true;
            } else {
              fields.push({
                objectTypeId: '0-1',
                name: hubspotField,
                value: value
              });
              addedFields[hubspotField] = true;
            }
          }
        }
      }
    }

    return fields;
  }

  // =====================================================
  // SHOW FORM SUCCESS MESSAGE
  // =====================================================
  function showFormSuccess(form) {
    console.log('[Ridgeline] Showing success message');

    const successHTML =
      '<div class="form-success" style="text-align: center; padding: 2rem 1rem;">' +
        '<div style="font-size: 3rem; margin-bottom: 1rem; color: #3E5A6D;">&#10004;</div>' +
        '<h3 style="margin-bottom: 0.5rem; color: #3E5A6D;">Thank You!</h3>' +
        '<p style="margin-bottom: 1rem; color: #333;">We\'ll contact you within 30 minutes.</p>' +
        '<p style="margin-bottom: 1.5rem; color: #666;">For immediate service, call us directly:</p>' +
        '<a href="tel:+14353759148" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">' +
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
    errorBanner.style.cssText = 'background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;';
    errorBanner.innerHTML = '<p style="margin: 0 0 0.5rem 0; font-weight: 600;">Something went wrong.</p>' +
      '<p style="margin: 0;">Please call us at <a href="tel:+14353759148" style="color: #721c24; font-weight: 600;">(435) 375-9148</a></p>';

    form.insertBefore(errorBanner, form.firstChild);
    errorBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // =====================================================
  // SHOW FIELD ERROR
  // =====================================================
  function showFieldError(field, message) {
    var errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#dc3545';
    errorDiv.style.fontSize = '0.85rem';
    errorDiv.style.marginTop = '0.25rem';
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
// ADDITIONAL CSS FOR FORM VALIDATION (injected)
// =====================================================
var validationStyles = document.createElement('style');
validationStyles.textContent =
  '.field-error { border-color: #dc3545 !important; box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15) !important; }' +
  '.form-success { animation: fadeIn 0.5s ease; }' +
  '.form-error-banner { animation: fadeIn 0.3s ease; }' +
  '@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }' +
  'button[type="submit"]:disabled { cursor: not-allowed; }';
document.head.appendChild(validationStyles);
