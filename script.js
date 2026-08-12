/**
 * Ridgeline Pest Control - Main JavaScript
 * Handles mobile menu, form submission to Formspree, and smooth scrolling
 */

const FORMSPREE_URL = 'https://formspree.io/f/xojnwkar';

// =====================================================
// ANALYTICS (GA4)
// Paste the measurement ID (G-XXXXXXXXXX) once the GA4
// property exists. Empty string = analytics fully off.
// =====================================================
const GA4_ID = 'G-N5N142MWMK';

function track(eventName, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params || {});
  }
}

if (GA4_ID) {
  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
  document.head.appendChild(gtagScript);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA4_ID);
}

document.addEventListener('DOMContentLoaded', function() {
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
  // Forms also carry action="https://formspree.io/f/..." so a plain
  // POST still delivers the lead if this script never runs.
  // =====================================================
  const forms = document.querySelectorAll('form');

  // Inline validation: friendly messages on blur, never on keystroke.
  // Native browser validation stays active as a no-JS fallback because
  // novalidate is only added here, at runtime.
  const WASHINGTON_COUNTY_ZIPS = [
    '84722', '84725', '84733', '84737', '84738', '84745', '84746', '84757',
    '84763', '84765', '84767', '84770', '84771', '84774', '84779', '84780',
    '84781', '84782', '84783', '84784', '84790', '84791'
  ];

  const FIELD_MESSAGES = {
    name: 'Please enter your name.',
    phone: 'Please enter your phone number.',
    zip: 'Please enter your 5-digit zip code.'
  };

  function getFieldError(input) {
    if (input.name === '_gotcha' || input.type === 'hidden') return '';
    const value = input.value.trim();
    if (input.hasAttribute('required') && !value) {
      return FIELD_MESSAGES[input.name] || 'This field is required.';
    }
    if (!value) return '';
    if (input.type === 'tel' && value.replace(/\D/g, '').length < 10) {
      return 'Please enter a 10-digit phone number.';
    }
    if (input.name === 'zip' && !/^[0-9]{5}$/.test(value)) {
      return 'Please enter a 5-digit zip code.';
    }
    if (input.type === 'email' && input.validity.typeMismatch) {
      return 'That email address doesn\'t look right.';
    }
    return '';
  }

  function messageEl(input, className) {
    const group = input.closest('.form-group') || input.parentElement;
    let el = group.querySelector('.' + className);
    if (!el) {
      el = document.createElement('div');
      el.className = className;
      group.appendChild(el);
    }
    return el;
  }

  function showFieldError(input) {
    const error = getFieldError(input);
    const el = messageEl(input, 'field-error');
    el.textContent = error;
    el.style.display = error ? 'block' : 'none';
    input.classList.toggle('field-invalid', !!error);
    input.setAttribute('aria-invalid', error ? 'true' : 'false');
    return !error;
  }

  function showZipNote(input) {
    const value = input.value.trim();
    const outside = /^[0-9]{5}$/.test(value) && WASHINGTON_COUNTY_ZIPS.indexOf(value) === -1;
    const el = messageEl(input, 'zip-note');
    el.textContent = outside
      ? 'That zip looks outside our usual service area. Send it anyway and we\'ll confirm when we call.'
      : '';
    el.style.display = outside ? 'block' : 'none';
  }

  function validateForm(form) {
    let firstInvalid = null;
    form.querySelectorAll('input, select, textarea').forEach(function(input) {
      if (!showFieldError(input) && !firstInvalid) {
        firstInvalid = input;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return !firstInvalid;
  }

  function showFormError(form) {
    let err = form.querySelector('.form-error-message');
    if (!err) {
      err = document.createElement('div');
      err.className = 'form-error-message';
      err.setAttribute('role', 'alert');
      const submitWrap = form.querySelector('.form-submit');
      if (submitWrap) {
        form.insertBefore(err, submitWrap);
      } else {
        form.appendChild(err);
      }
    }
    err.innerHTML = 'Something went wrong sending your request. Please try again, or call us at <a href="tel:+14353759148">(435) 375-9148</a>.';
  }

  forms.forEach(function(form) {
    // Custom validation takes over only when JS is running
    form.setAttribute('novalidate', '');

    form.querySelectorAll('input, select, textarea').forEach(function(input) {
      if (input.name === '_gotcha' || input.type === 'hidden') return;

      input.addEventListener('blur', function() {
        // Only validate fields the user has interacted with
        if (input.value.trim() || input.classList.contains('field-invalid')) {
          showFieldError(input);
        }
        if (input.name === 'zip') {
          showZipNote(input);
        }
      });

      // Reward early: clear an error as soon as the fix is typed
      input.addEventListener('input', function() {
        if (input.classList.contains('field-invalid')) {
          showFieldError(input);
        }
      });
    });

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();

      if (!validateForm(form)) {
        return;
      }

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

        track('generate_lead', {
          form_subject: data._subject || '',
          page_path: window.location.pathname
        });

        // Show success message
        form.innerHTML =
          '<div class="form-success-message">' +
            '<div class="success-icon"><svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#check"></use></svg></div>' +
            '<h3>Thank You!</h3>' +
            '<p class="success-main">Your request has been submitted successfully.</p>' +
            '<p class="success-sub">We\'ll call you back within 1 business hour.</p>' +
            '<p class="success-phone">Need immediate help? Call:</p>' +
            '<a href="tel:+14353759148" class="btn btn-primary success-btn">' +
              '<svg class="icon" aria-hidden="true" focusable="false"><use href="icons.svg#phone"></use></svg> (435) 375-9148' +
            '</a>' +
          '</div>';

        form.scrollIntoView({ behavior: 'smooth', block: 'center' });

      } catch (error) {
        showFormError(form);

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
  // PHONE CLICK TRACKING
  // =====================================================
  document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
    link.addEventListener('click', function() {
      track('phone_call_click', { page_path: window.location.pathname });
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
  // Content is visible by default; it is only hidden (via the
  // .pre-animate class) once we know the observer can reveal it,
  // and a safety timer reveals everything regardless.
  // =====================================================
  if ('IntersectionObserver' in window) {
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
      el.classList.add('pre-animate');
      observer.observe(el);
    });

    // Safety net: never leave content hidden
    setTimeout(function() {
      animateElements.forEach(function(el) {
        el.classList.add('fade-in-up');
      });
    }, 3000);
  }
});

// =====================================================
// CSS FOR FORM SUCCESS / ERROR MESSAGES
// =====================================================
const formStyles = document.createElement('style');
formStyles.textContent =
  '.form-success-message { text-align: center; padding: 2rem 1rem; animation: fadeInUp 0.5s ease; background: linear-gradient(135deg, #2D5016 0%, #3d6b1e 100%); border-radius: 8px; color: white; }' +
  '.form-success-message .success-icon { font-size: 3rem; margin-bottom: 0.5rem; }' +
  '.form-success-message h3 { color: white; font-size: 1.5rem; margin-bottom: 0.5rem; }' +
  '.form-success-message .success-main { color: rgba(255,255,255,0.95); font-size: 1rem; margin-bottom: 0.25rem; }' +
  '.form-success-message .success-sub { color: rgba(255,255,255,0.85); margin-bottom: 0.75rem; }' +
  '.form-success-message .success-phone { color: rgba(255,255,255,0.85); margin-bottom: 0.5rem; font-size: 0.9rem; }' +
  '.form-success-message .success-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #C05617; color: white; padding: 0.75rem 1.5rem; border-radius: 5px; text-decoration: none; font-weight: bold; }' +
  '.form-success-message .success-btn:hover { background: #A94A11; }' +
  '.form-error-message { background: #FDECEA; border: 1px solid #E57373; color: #B71C1C; border-radius: 5px; padding: 0.75rem 1rem; margin-bottom: 1rem; font-size: 0.95rem; }' +
  '.form-error-message a { color: #B71C1C; font-weight: bold; text-decoration: underline; }' +
  '.field-error { display: none; color: #B71C1C; font-size: 0.85rem; margin-top: 0.3rem; }' +
  '.zip-note { display: none; color: #5A6B75; font-size: 0.85rem; margin-top: 0.3rem; }' +
  'input.field-invalid, select.field-invalid { border-color: #E57373; }' +
  '@keyframes fadeInUp { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }';

document.head.appendChild(formStyles);
