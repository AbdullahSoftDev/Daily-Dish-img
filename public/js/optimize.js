// optimize.js - AUTO PERFORMANCE OPTIMIZER
// Add this script to your <head> section

(function() {
    'use strict';
    
    console.log('🚀 Auto Performance Optimizer Started...');
    
    // ==================== CRITICAL CSS INLINING ====================
    function injectCriticalCSS() {
        const criticalCSS = `
            /* Critical Above-the-Fold CSS */
            .hero-header { 
                opacity: 0; 
                transition: opacity 0.3s ease-in;
            }
            .loaded .hero-header { 
                opacity: 1; 
            }
            .img-fluid { 
                max-width: 100%; 
                height: auto; 
            }
            .page-header {
                background-size: cover !important;
                background-position: center !important;
            }
            /* Prevent layout shifts */
            [loading="lazy"] {
                min-height: 1px;
            }
            /* Ensure LCP image doesn't cause CLS */
            .hero-header img {
                width: 100%;
                height: auto;
                aspect-ratio: 16/9;
            }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        style.setAttribute('data-optimizer', 'critical-css');
        document.head.appendChild(style);
        
        // Mark page as loaded
        window.addEventListener('load', function() {
            document.documentElement.classList.add('loaded');
        });
    }

    // ==================== RESOURCE HINTS ====================
    function injectResourceHints() {
        const hints = [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
            { rel: 'preconnect', href: 'https://www.gstatic.com' },
            { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
            { rel: 'dns-prefetch', href: 'https://www.gstatic.com' },
            { rel: 'dns-prefetch', href: 'https://firebasestorage.googleapis.com' }
        ];

        hints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
            document.head.appendChild(link);
        });
    }

    // ==================== LCP IMAGE OPTIMIZATION ====================
    function optimizeLCPImages() {
        // Find hero images and optimize them
        const heroImages = document.querySelectorAll('.hero-header img, .carousel img, [class*="hero"] img');
        
        heroImages.forEach(img => {
            if (img.complete) {
                applyLCPOptimizations(img);
            } else {
                img.addEventListener('load', function() {
                    applyLCPOptimizations(this);
                });
            }
        });

        function applyLCPOptimizations(img) {
            // Add critical attributes
            img.loading = 'eager';
            img.decoding = 'async';
            img.fetchPriority = 'high';
            
            // Ensure proper sizing
            if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
                img.setAttribute('width', '800');
                img.setAttribute('height', '600');
            }
            
            // Add error handling
            img.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhl/aWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MDAgMzAwTDUwMCA0MDBMNTAwIDMwMEg0MDBaIiBmaWxsPSIjODFDNDA4Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iNTAwIiBmaWxsPSIjNjg3NDc3IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRhaWx5IERpc2g8L3RleHQ+Cjwvc3ZnPgo=';
            };
        }
    }

function preloadSurpriseMeImages(dishes) {
    console.log('🔄 Preloading surprise me images...');
    
    // Preload first 10 random dish images for instant display during spin
    const imagesToPreload = dishes.slice(0, 10);
    
    imagesToPreload.forEach(dish => {
        if (dish.image) {
            const img = new Image();
            img.src = dish.image;
            img.onload = () => {
                console.log(`✅ Preloaded surprise image: ${dish.name}`);
            };
            img.onerror = () => {
                console.log(`❌ Failed to preload: ${dish.name}`);
            };
        }
    });
}
// Call this in your existing optimize.js init function
document.addEventListener('DOMContentLoaded', enhanceImageLoading);
// Add this SIMPLE version to optimize.js - NO CLASS NEEDED
function enhanceImageLoading() {
    console.log('🚀 Enhancing image loading...');
    
    // Simple preload for critical images
    const criticalImages = [
        'img/Daily Dish Template.webp',
        'img/DailyDish.webp', 
        'img/Weekly Schedule.webp',
        'img/Chicken-Biryani.webp'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
        console.log(`✅ Preloaded: ${src}`);
    });
    
    // Enhanced lazy loading - EXCLUDE surprise me images
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        // Check if this is a surprise me image
        const isSurpriseMeImage = img.closest('#selectedDish') || 
                                 img.parentElement?.closest('#selectedDish') ||
                                 img.src.includes('surprise') ||
                                 img.alt.includes('Surprise');
        
        if (isSurpriseMeImage) {
            // Remove lazy loading for surprise me images
            img.loading = 'eager';
            console.log('🎲 Surprise me image - eager loading enabled');
        } else if (!img.hasAttribute('data-src')) {
            img.setAttribute('data-src', img.src);
        }
    });
    
    // Load visible images immediately
    setTimeout(() => {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            const rect = img.getBoundingClientRect();
            if (rect.top < window.innerHeight * 2) {
                const src = img.getAttribute('data-src') || img.src;
                img.src = src;
            }
        });
    }, 100);
}

// Call this in your existing optimize.js
document.addEventListener('DOMContentLoaded', enhanceImageLoading);
    // ==================== SCRIPT OPTIMIZATION ====================
    function optimizeScriptLoading() {
        // Scripts to defer (non-critical)
        const scriptsToDefer = [
            'ai-features.js',
            'recipe-detail-manager.js',
            'shop-filter-system.js',
            'filter-system.js',
            'homepage-manager.js'
        ];

        // Find and defer non-critical scripts
        document.querySelectorAll('script[src]').forEach(script => {
            const src = script.getAttribute('src');
            scriptsToDefer.forEach(pattern => {
                if (src.includes(pattern) && !script.hasAttribute('defer')) {
                    script.setAttribute('defer', '');
                    console.log('📜 Deferred:', src);
                }
            });
        });

        // Load heavy scripts after user interaction
        if (window.innerWidth <= 768) {
            const heavyScripts = ['ai-features.js', 'recipe-detail-manager.js'];
            
            const loadOnInteraction = function() {
                heavyScripts.forEach(script => {
                    const existing = document.querySelector(`script[src*="${script}"]`);
                    if (!existing) {
                        const newScript = document.createElement('script');
                        newScript.src = `js/${script}`;
                        newScript.defer = true;
                        document.body.appendChild(newScript);
                    }
                });
                // Remove event listeners after first interaction
                ['click', 'scroll', 'touchstart'].forEach(event => {
                    document.removeEventListener(event, loadOnInteraction);
                });
            };

            ['click', 'scroll', 'touchstart'].forEach(event => {
                document.addEventListener(event, loadOnInteraction, { once: true });
            });
        }
    }

    // ==================== IMAGE LAZY LOADING ENHANCEMENT ====================
    function enhanceLazyLoading() {
        // Add loading=lazy to all non-critical images
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach((img, index) => {
            // Don't lazy load above-the-fold images
            const rect = img.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8) {
                img.loading = 'eager';
            } else {
                img.loading = 'lazy';
            }
        });

        // Intersection Observer for better lazy loading
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                        }
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // ==================== MOBILE-SPECIFIC OPTIMIZATIONS ====================
    function applyMobileOptimizations() {
        if (window.innerWidth > 768) return;

        console.log('📱 Applying mobile optimizations...');

        // Disable auto-playing carousels on mobile
        if (typeof jQuery !== 'undefined' && jQuery().owlCarousel) {
            const carousels = document.querySelectorAll('.owl-carousel');
            carousels.forEach(carousel => {
                const $carousel = jQuery(carousel);
                if ($carousel.data('owl.carousel')) {
                    $carousel.trigger('destroy.owl.carousel');
                    $carousel.owlCarousel({
                        autoplay: false, // Disable autoplay on mobile
                        dots: true,
                        loop: true,
                        responsive: {
                            0: { items: 1 },
                            576: { items: 2 },
                            768: { items: 3 }
                        }
                    });
                }
            });
        }

        // Reduce animation intensity on mobile
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
                
                .carousel-item {
                    transition: transform 0.6s ease-in-out !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ==================== FIREBASE LOADING OPTIMIZATION ====================
    function optimizeFirebaseLoading() {
        // Delay Firebase initialization until needed
        const originalFirebaseConfig = window.firebaseConfig;
        
        if (originalFirebaseConfig) {
            // Only initialize Firebase when auth is needed
            const initializeFirebaseOnDemand = function() {
                if (window.firebase && !window.firebase.apps.length) {
                    try {
                        window.firebase.initializeApp(originalFirebaseConfig);
                        console.log('🔥 Firebase initialized on demand');
                    } catch (error) {
                        console.log('🔥 Firebase already initialized');
                    }
                }
            };

            // Initialize on auth-related interactions
            const authTriggers = document.querySelectorAll('[onclick*="userManager"], [onclick*="login"], [onclick*="showLoginModal"]');
            authTriggers.forEach(trigger => {
                trigger.addEventListener('click', initializeFirebaseOnDemand, { once: true });
            });
        }
    }

    // ==================== PERFORMANCE MONITORING ====================
    function setupPerformanceMonitoring() {
        // Monitor LCP
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries.find(entry => entry.entryType === 'largest-contentful-paint');
            
            if (lcpEntry) {
                console.log('🎯 LCP:', lcpEntry.startTime, 'ms');
                
                if (lcpEntry.startTime > 2500) {
                    console.warn('⚠️ LCP is too high:', lcpEntry.startTime, 'ms');
                }
            }
        });

        try {
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.log('PerformanceObserver not supported');
        }

        // Log Core Web Vitals
        window.addEventListener('load', function() {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (navigationTiming) {
                console.log('📊 Load Time:', navigationTiming.loadEventEnd - navigationTiming.fetchStart, 'ms');
                console.log('📊 DOM Content Loaded:', navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart, 'ms');
            }
        });
    }

    // ==================== MAIN INITIALIZATION ====================
    function init() {
        // Phase 1: Immediate optimizations (before DOM ready)
        injectCriticalCSS();
        injectResourceHints();
        
        // Phase 2: DOM-ready optimizations
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                optimizeLCPImages();
                optimizeScriptLoading();
                enhanceLazyLoading();
                applyMobileOptimizations();
                optimizeFirebaseLoading();
            });
        } else {
            optimizeLCPImages();
            optimizeScriptLoading();
            enhanceLazyLoading();
            applyMobileOptimizations();
            optimizeFirebaseLoading();
        }

        // Phase 3: Post-load optimizations
        window.addEventListener('load', function() {
            setupPerformanceMonitoring();
            console.log('✅ All optimizations applied');
        });

        // Quick win: Preload visible images
        setTimeout(() => {
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                const rect = img.getBoundingClientRect();
                if (rect.top < window.innerHeight * 2) {
                    img.loading = 'eager';
                }
            });
        }, 100);
    }

    // Start the optimizer
    init();

    // Export for manual control
    window.PerformanceOptimizer = {
        reload: function() {
            console.log('🔄 Reloading optimizer...');
            init();
        },
        stats: function() {
            const timing = performance.timing;
            return {
                loadTime: timing.loadEventEnd - timing.navigationStart,
                domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                lcp: null // Will be populated by PerformanceObserver
            };
        }
    };

})();

// Service Worker registration for caching (optional)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    navigator.serviceWorker.register('/sw.js').catch(console.log);
}