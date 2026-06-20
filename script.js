
// Dark/Light Mode Toggle
let cloudStoreData = null;

function getLocalJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    return fallback;
  }
}

const themeToggles = document.querySelectorAll('[data-theme-toggle]');

function syncThemeToggles() {
  const isLight = document.body.classList.contains('light-mode');
  themeToggles.forEach((toggle) => {
    const label = toggle.querySelector('span');
    toggle.querySelector('i').className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    if (label) label.textContent = isLight ? 'Light mode' : 'Dark mode';
  });
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
  syncThemeToggles();
}

themeToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    syncThemeToggles();
  });
});

initializeTheme();

// Announcement banner controlled from /369 admin panel
const defaultAnnouncement = 'Grand Opening Special! Get 30% off on all products this week!';

function renderAnnouncement() {
  const announcementText = document.getElementById('announcementText');
  if (!announcementText) return;

  announcementText.textContent = cloudStoreData?.announcementText ||
    localStorage.getItem('announcementText') ||
    defaultAnnouncement;
}

renderAnnouncement();

window.addEventListener('storage', (event) => {
  if (event.key === 'announcementText' || event.key === 'announcementChanged') {
    renderAnnouncement();
  }
});

// Featured products controlled from /369 admin panel
const defaultFeaturedProducts = [
  {
    title: 'Premium Collection',
    subtitle: 'High-quality items for everyday use',
    badge: 'Popular',
    image: 'images/logo2.jpg'
  },
  {
    title: 'Exclusive Deals',
    subtitle: 'Limited edition products for you',
    badge: 'Exclusive',
    image: 'images/hro.jpg'
  },
  {
    title: 'Best Sellers',
    subtitle: 'Customer favorites and top picks',
    badge: 'Best Seller',
    image: 'images/hro2.jpg'
  },
  {
    title: 'Special Offers',
    subtitle: 'Unbeatable prices this season',
    badge: 'Sale -30%',
    image: 'images/smoke.jpeg'
  },
  {
    title: 'New Arrivals',
    subtitle: 'Fresh stock just added',
    badge: 'New',
    image: 'images/linkin.png'
  },
  {
    title: 'Premium Plus',
    subtitle: 'Luxury items for discerning customers',
    badge: 'Premium',
    image: 'images/logo.jpeg'
  }
];

function getFeaturedProducts() {
  const savedProducts = cloudStoreData?.featuredProducts || getLocalJson('featuredProducts', []);
  return defaultFeaturedProducts.map((product, index) => ({
    ...product,
    ...(savedProducts[index] || {})
  }));
}

function renderFeaturedProducts() {
  const cards = document.querySelectorAll('[data-featured-product]');
  if (!cards.length) return;

  const products = getFeaturedProducts();
  cards.forEach((card, index) => {
    const product = products[index] || defaultFeaturedProducts[index];
    const image = card.querySelector('[data-product-image]');
    const badge = card.querySelector('[data-product-badge]');
    const title = card.querySelector('[data-product-title]');
    const subtitle = card.querySelector('[data-product-subtitle]');

    if (image) {
      image.src = product.image;
      image.alt = product.title;
    }
    if (badge) badge.textContent = product.badge;
    if (title) title.textContent = product.title;
    if (subtitle) subtitle.textContent = product.subtitle;
  });
}

renderFeaturedProducts();

window.addEventListener('storage', (event) => {
  if (event.key === 'featuredProducts' || event.key === 'productsChanged') {
    renderFeaturedProducts();
  }
});

// Mobile Menu Toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
  });
});

// Countdown Timer
function formatCountdown(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatQatarTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Qatar',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    weekday: 'short'
  }).format(date);
}

function updateReturnProgress(remainingSeconds, totalSeconds) {
  const progressRing = document.getElementById('progressRing');
  const progressPercent = document.getElementById('progressPercent');
  if (!progressRing || !progressPercent) return;

  const circleLength = 2 * Math.PI * 52;
  const safeTotal = Math.max(1, totalSeconds);
  const percentLeft = Math.max(0, Math.min(100, Math.round((remainingSeconds / safeTotal) * 100)));

  progressRing.style.strokeDasharray = circleLength;
  progressRing.style.strokeDashoffset = circleLength * (1 - percentLeft / 100);
  progressPercent.textContent = `${percentLeft}%`;
}

function updateReturnDetails(label, remainingSeconds, totalSeconds, returnAt) {
  const countdownTimer = document.getElementById('countdownTimer');
  const countdownLabel = document.getElementById('countdownLabel');
  const qatarReturnTime = document.getElementById('qatarReturnTime');

  if (countdownLabel) countdownLabel.textContent = label;
  if (countdownTimer) countdownTimer.textContent = formatCountdown(remainingSeconds);
  if (qatarReturnTime) qatarReturnTime.textContent = formatQatarTime(returnAt);
  updateReturnProgress(remainingSeconds, totalSeconds);
}

function updateCountdown() {
  const statusText = document.getElementById('statusText');
  const statusDot = document.getElementById('statusDot');
  
  // Get custom settings from cloud sync or localStorage fallback
  const savedSettings = cloudStoreData?.storeSettings || getLocalJson('storeSettings', null);
  const now = new Date();
  let hours = now.getHours();
  
  // If admin has set custom values, use those
  if (savedSettings) {
    const settings = savedSettings;
    const totalSeconds = ((parseInt(settings.hours) || 0) * 3600) +
      ((parseInt(settings.minutes) || 0) * 60) +
      (parseInt(settings.seconds) || 0);
    const savedAtTime = settings.lastUpdated ? new Date(settings.lastUpdated).getTime() : Date.now();
    const savedAt = Number.isNaN(savedAtTime) ? Date.now() : savedAtTime;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - savedAt) / 1000));
    const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
    const returnAt = new Date(savedAt + totalSeconds * 1000);
    
    if (settings.status === 'unavailable') {
      statusText.textContent = 'Unavailable';
      statusDot.style.background = '#ef4444';
      updateReturnDetails('Returns in', remainingSeconds, totalSeconds, returnAt);
      return;
    } else {
      statusText.textContent = 'Available';
      statusDot.style.background = '#10b981';
      updateReturnDetails('Ready now', 0, 1, new Date());
      return;
    }
  }
  
  // Default behavior if no custom settings
  const storeOpen = 9;
  const storeClose = 21;
  
  if (hours >= storeOpen && hours < storeClose) {
    statusText.textContent = 'Available';
    statusDot.style.background = '#10b981';
    
    // Time until closing
    const openingTime = new Date();
    openingTime.setHours(storeOpen, 0, 0, 0);
    const closingTime = new Date();
    closingTime.setHours(storeClose, 0, 0, 0);
    const diff = closingTime - now;
    
    if (diff > 0) {
      const totalOpenSeconds = Math.max(1, Math.floor((closingTime - openingTime) / 1000));
      updateReturnDetails('Closes in', Math.floor(diff / 1000), totalOpenSeconds, closingTime);
    }
  } else if (hours >= storeClose || hours < storeOpen) {
    statusText.textContent = 'Closed';
    statusDot.style.background = '#ef4444';
    
    // Time until opening
    const openingTime = new Date();
    openingTime.setDate(openingTime.getDate() + (hours >= storeClose ? 1 : 0));
    openingTime.setHours(storeOpen, 0, 0, 0);
    const diff = openingTime - now;
    const closedStart = new Date(openingTime);
    closedStart.setDate(closedStart.getDate() - (hours >= storeClose ? 0 : 1));
    closedStart.setHours(storeClose, 0, 0, 0);
    const totalClosedSeconds = Math.max(1, Math.floor((openingTime - closedStart) / 1000));
    
    updateReturnDetails('Returns in', Math.floor(diff / 1000), totalClosedSeconds, openingTime);
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

if (window.storeCloud?.enabled) {
  window.storeCloud.load().then((data) => {
    if (!data) return;
    cloudStoreData = data;
    renderAnnouncement();
    renderFeaturedProducts();
    updateCountdown();
  }).catch((error) => {
    console.warn('Unable to load cloud store settings:', error);
  });

  window.storeCloud.subscribe((data) => {
    cloudStoreData = data;
    renderAnnouncement();
    renderFeaturedProducts();
    updateCountdown();
  });
}

// Smooth Scroll Animation
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains('section-title')) {
        entry.target.style.animation = 'titleRevealModern 1s cubic-bezier(0.22, 1, 0.36, 1) forwards';
      } else if (entry.target.classList.contains('section-subtitle')) {
        entry.target.style.animation = 'subtitleRise 0.8s ease 0.3s both';
      } else if (entry.target.classList.contains('store-name')) {
        entry.target.style.animation = 'titleRevealModern 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards';
      } else {
        entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
      }
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Initial styles and observer setup
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll(
    '.product-card, .founder-card, .review-card, .section-title, .section-subtitle, .store-name'
  );
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
});

// Form Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const successMsg = document.createElement('div');
    successMsg.textContent = 'Thank you! Your message has been sent successfully.';
    successMsg.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px;
      z-index: 1001;
      animation: slideDown 0.5s ease-out;
    `;
    document.body.appendChild(successMsg);
    contactForm.reset();
    
    setTimeout(() => {
      successMsg.style.animation = 'slideUp 0.5s ease-out forwards';
      setTimeout(() => successMsg.remove(), 500);
    }, 3000);
  });
}

// Newsletter Subscription
const newsletterEmail = document.getElementById('newsletterEmail');
if (newsletterEmail) {
  const newsletterBtn = newsletterEmail.nextElementSibling;
  newsletterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (newsletterEmail.value) {
      const successMsg = document.createElement('div');
      successMsg.textContent = 'Successfully subscribed to our newsletter!';
      successMsg.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        z-index: 1001;
        animation: slideDown 0.5s ease-out;
      `;
      document.body.appendChild(successMsg);
      newsletterEmail.value = '';
      
      setTimeout(() => {
        successMsg.style.animation = 'slideUp 0.5s ease-out forwards';
        setTimeout(() => successMsg.remove(), 500);
      }, 3000);
    }
  });
}

// Multi-language Store Name Animation
const storeNameTranslations = [
  "Online Shopping & Delivery Store",      // English
  "अनलाइन सपिङ र डेलिभरी स्टोर",             // Nepali
  "Tindahan ng Online Shopping at Delivery", // Filipino
  "متجر التسوق والتوصيل أونلاين"             // Arabic
];

const navLogoText = document.querySelector('.nav-logo span');
const heroStoreName = document.querySelector('.hero-content .store-name');

if (navLogoText || heroStoreName) {
  let currentIndex = 0;
  setInterval(() => {
    if (navLogoText) navLogoText.style.opacity = '0';
    if (heroStoreName) heroStoreName.style.opacity = '0';
    
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % storeNameTranslations.length;
      const nextText = storeNameTranslations[currentIndex];
      
      if (navLogoText) {
        navLogoText.textContent = nextText;
        navLogoText.style.opacity = '1';
      }
      if (heroStoreName) {
        heroStoreName.textContent = nextText;
        heroStoreName.style.opacity = '1';
      }
    }, 500); // Time for fade out
  }, 4000); // Change interval
}
