/* ============================================
   LUKMAN CODE CRAFT - Portfolio JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // DOM Elements
    // ==========================================
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav__link');
    const header = document.getElementById('header');
    const scrollUp = document.getElementById('scroll-up');
    const contactForm = document.getElementById('contact-form');
    const toast = document.getElementById('toast');

    // ==========================================
    // Mobile Menu Toggle
    // ==========================================
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.add('show-menu');
        });
    }

    if (navClose) {
        navClose.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
        });
    }

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show-menu');
        });
    });

    // ==========================================
    // Typing Effect
    // ==========================================
    const typingText = document.querySelector('.typing-text');
    const words = [
        'Full-Stack Developer',
        'Problem Solver',
        'UI/UX Enthusiast',
        'Open Source Contributor',
        'Tech Entrepreneur'
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typingText.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = 50;
        } else {
            typingText.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 100;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingDelay = 2000; // Pause at end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingDelay = 500; // Pause before next word
        }

        setTimeout(type, typingDelay);
    }

    if (typingText) {
        setTimeout(type, 1000);
    }

    // ==========================================
    // Scroll Spy - Active Navigation Link
    // ==========================================
    const sections = document.querySelectorAll('section[id]');

    function scrollActive() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav__link[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active-link');
                } else {
                    navLink.classList.remove('active-link');
                }
            }
        });
    }

    window.addEventListener('scroll', scrollActive);

    // ==========================================
    // Header Scroll Effect
    // ==========================================
    function scrollHeader() {
        if (window.scrollY >= 80) {
            header.classList.add('scroll-header');
        } else {
            header.classList.remove('scroll-header');
        }
    }

    window.addEventListener('scroll', scrollHeader);

    // ==========================================
    // Back to Top Button
    // ==========================================
    function scrollUpBtn() {
        if (window.scrollY >= 560) {
            scrollUp.classList.add('show-scroll');
        } else {
            scrollUp.classList.remove('show-scroll');
        }
    }

    window.addEventListener('scroll', scrollUpBtn);

    // ==========================================
    // Scroll Reveal Animation (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll(
        '.about__card, .skills__category, .project__card, .journey__item, .contact__card, .contact__form-group'
    );

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add stagger delay based on element index within parent
                setTimeout(() => {
                    entry.target.classList.add('reveal', 'active');
                }, index * 100);
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // Also reveal section titles and subtitles
    const sectionHeaders = document.querySelectorAll('.section__title, .section__subtitle');
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal', 'active');
                headerObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });

    sectionHeaders.forEach(el => {
        el.classList.add('reveal');
        headerObserver.observe(el);
    });

    // ==========================================
    // Contact Form Handling
    // ==========================================
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (!name || !email || !message) {
                return;
            }

            // Show success toast
            showToast('Message sent successfully! I will get back to you soon.');

            // Reset form
            contactForm.reset();
        });
    }

    function showToast(message) {
        const toastMessage = toast.querySelector('.toast__message');
        if (toastMessage) {
            toastMessage.textContent = message;
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // ==========================================
    // Smooth Scroll for Anchor Links (fallback)
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // Parallax Effect for Hero Background Glow
    // ==========================================
    const heroGlow = document.querySelector('.hero::before');
    
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 20;
            const y = (e.clientY / window.innerHeight) * 20;
            
            const heroBefore = document.querySelector('.hero');
            if (heroBefore) {
                heroBefore.style.setProperty('--glow-x', `${x}px`);
                heroBefore.style.setProperty('--glow-y', `${y}px`);
            }
        });
    }

    // ==========================================
    // Add hover effect to project cards (3D tilt)
    // ==========================================
    const projectCards = document.querySelectorAll('.project__card');

    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    console.log('LUKMAN CODE CRAFT Portfolio loaded successfully!');
});
