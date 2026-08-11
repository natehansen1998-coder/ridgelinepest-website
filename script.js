/**
 * Ridgeline Pest Control - Main JavaScript
 * Handles mobile menu, form submission to Formspree, and smooth scrolling
 */

const FORMSPREE_URL = 'https://formspree.io/f/xojnwkar';

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
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      e.stopPropagation();

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
  '.form-success-message .success-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: #E67E42; color: white; padding: 0.75rem 1.5rem; border-radius: 5px; text-decoration: none; font-weight: bold; }' +
  '.form-success-message .success-btn:hover { background: #d06a2f; }' +
  '.form-error-message { background: #FDECEA; border: 1px solid #E57373; color: #B71C1C; border-radius: 5px; padding: 0.75rem 1rem; margin-bottom: 1rem; font-size: 0.95rem; }' +
  '.form-error-message a { color: #B71C1C; font-weight: bold; text-decoration: underline; }' +
  '@keyframes fadeInUp { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }';

document.head.appendChild(formStyles);
