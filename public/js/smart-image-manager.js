// smart-image-manager.js - INSTANT IMAGE LOADING SYSTEM
class SmartImageManager {
    constructor() {
        this.imageCache = new Map();
        this.preloadedImages = new Set();
        this.observer = null;
        this.criticalImages = [];
        this.init();
    }

    init() {
        console.log('🚀 Smart Image Manager Initialized');
        this.preloadCriticalImages();
        this.setupIntersectionObserver();
        this.setupPreloadStrategy();
        this.setupCacheCleanup();
    }

    // 1. PRELOAD CRITICAL IMAGES - Above the fold
    preloadCriticalImages() {
        const criticalImages = [
            // Hero images
            'img/Daily Dish Template.webp',
            'img/DailyDish.webp',
            // Featured recipe images (first 6)
            'img/Chicken-Biryani.webp',
            'img/Chicken-Karahi.webp',
            'img/Vegetable Pulao.webp',
            // AI feature images
            'img/Weekly Schedule.webp',
            'img/Suprise Me.webp',
            'img/Custom Dish.webp'
        ];

        criticalImages.forEach(src => {
            this.preloadImage(src);
        });
    }

    preloadImage(src) {
        if (this.preloadedImages.has(src)) return;

        const img = new Image();
        img.src = src;
        img.onload = () => {
            this.preloadedImages.add(src);
            this.imageCache.set(src, img);
            console.log(`✅ Preloaded: ${src}`);
        };
    }

    // 2. SMART LAZY LOADING WITH INSTANT CACHE
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            this.fallbackLazyLoad();
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImageInstantly(img);
                    this.observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // Load 50px before entering viewport
            threshold: 0.1
        });

        // Observe all lazy images
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            this.observer.observe(img);
        });
    }

    // 3. INSTANT IMAGE LOADING WITH CACHE
    loadImageInstantly(img) {
        const src = img.getAttribute('data-src') || img.src;
        
        // Check cache first
        if (this.imageCache.has(src)) {
            img.src = src;
            img.classList.add('loaded');
            return;
        }

        // Load with priority
        this.loadWithPriority(src, img);
    }

    loadWithPriority(src, imgElement) {
        const img = new Image();
        
        // Set up loading states
        imgElement.classList.add('loading');
        
        img.onload = () => {
            // Add to cache
            this.imageCache.set(src, img);
            
            // Apply to element with fade-in effect
            imgElement.src = src;
            imgElement.classList.remove('loading');
            imgElement.classList.add('loaded');
            
            console.log(`🖼️ Loaded: ${src}`);
        };

        img.onerror = () => {
            imgElement.classList.remove('loading');
            imgElement.classList.add('error');
            console.error(`❌ Failed to load: ${src}`);
        };

        img.src = src;
    }

    // 4. PROGRESSIVE LOADING - Low quality placeholder first
    setupProgressiveLoading() {
        // Create low-quality placeholder versions
        document.querySelectorAll('img[data-src]').forEach(img => {
            const src = img.getAttribute('data-src');
            const lowQualitySrc = this.getLowQualityVersion(src);
            
            // Load low quality first
            const lowQualityImg = new Image();
            lowQualityImg.src = lowQualitySrc;
            lowQualityImg.onload = () => {
                img.src = lowQualitySrc;
                img.classList.add('low-quality');
                
                // Then load high quality
                this.loadImageInstantly(img);
            };
        });
    }

    getLowQualityVersion(src) {
        // For webp images, you might have low-quality versions
        // If not, use the same image but with blur effect
        return src;
    }

    // 5. CACHE MANAGEMENT
    setupCacheCleanup() {
        // Clean cache every 10 minutes
        setInterval(() => {
            this.cleanCache();
        }, 10 * 60 * 1000);
    }

    cleanCache() {
        const maxSize = 100; // Keep 100 images in cache
        if (this.imageCache.size > maxSize) {
            const keys = Array.from(this.imageCache.keys());
            const toRemove = keys.slice(0, this.imageCache.size - maxSize);
            
            toRemove.forEach(key => {
                this.imageCache.delete(key);
            });
            
            console.log(`🧹 Cleaned ${toRemove.length} images from cache`);
        }
    }

    // 6. FALLBACK FOR OLD BROWSERS
    fallbackLazyLoad() {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
            }
        });
    }

    // 7. MANUAL IMAGE PRELOADING FOR SPECIFIC PAGES
    preloadPageImages(pageType) {
        const pageImages = {
            'homepage': [
                'img/Daily Dish Template.webp',
                'img/DailyDish.webp',
                'img/Weekly Schedule.webp',
                'img/Suprise Me.webp',
                'img/Custom Dish.webp'
            ],
            'shop': [
                // Preload first 12 shop images
                'img/fruite-item-1.webp',
                'img/fruite-item-2.webp',
                'img/fruite-item-3.webp',
                'img/fruite-item-4.webp',
                'img/fruite-item-5.webp',
                'img/fruite-item-6.webp'
            ],
            'recipe-detail': [
                'img/single-item.webp'
            ]
        };

        const images = pageImages[pageType] || [];
        images.forEach(src => this.preloadImage(src));
    }

    // 8. PRIORITY LOADING FOR USER INTERACTIONS
    loadOnHover(container) {
        container.addEventListener('mouseenter', (e) => {
            const target = e.target.closest('[data-preload-on-hover]');
            if (target) {
                const imageUrl = target.getAttribute('data-image-url');
                if (imageUrl) {
                    this.preloadImage(imageUrl);
                }
            }
        }, { passive: true });
    }

    // 9. BATCH LOADING FOR BETTER PERFORMANCE
    loadImagesInViewport() {
        const viewportImages = Array.from(document.querySelectorAll('img[loading="lazy"]'))
            .filter(img => {
                const rect = img.getBoundingClientRect();
                return (
                    rect.top < window.innerHeight * 2 && // Within 2 viewports
                    rect.bottom > -window.innerHeight
                );
            });

        // Load in batches of 3
        const batchSize = 3;
        for (let i = 0; i < viewportImages.length; i += batchSize) {
            const batch = viewportImages.slice(i, i + batchSize);
            setTimeout(() => {
                batch.forEach(img => this.loadImageInstantly(img));
            }, i * 100); // Stagger loads
        }
    }
}

// Initialize immediately
window.smartImageManager = new SmartImageManager();

// CSS for loading states
const imageLoadingCSS = `
    img.loading {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
    }
    
    img.loaded {
        animation: fadeIn 0.5s ease-in;
    }
    
    img.low-quality {
        filter: blur(5px);
        transition: filter 0.3s ease;
    }
    
    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = imageLoadingCSS;
document.head.appendChild(style);