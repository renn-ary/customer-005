document.addEventListener('DOMContentLoaded', function() {
    // 1. Lottie Loader Logic & Preload All Assets
    const loader = document.getElementById('loader');
    const lottieContainer = document.getElementById('lottie-container');
    
    const loaderAnim = lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'Assets/Lottie/love.json'
    });

    // Change Lottie color to Sage Green
    lottieContainer.style.filter = 'invert(35%) sepia(20%) saturate(890%) hue-rotate(60deg) brightness(95%) contrast(90%)';

    // Preload ONLY critical assets (for initial page load)
    const assetsToPreload = [
        'Assets/Image/backgroundcover.jpg' // Only background cover
    ];

    let loadedCount = 0;
    const totalAssets = assetsToPreload.length;

    assetsToPreload.forEach(src => {
        if (src.endsWith('.mp3')) {
            const audio = new Audio();
            audio.addEventListener('canplaythrough', onAssetLoad);
            audio.addEventListener('error', onAssetLoad); // Count errors as loaded
            audio.src = src;
        } else {
            const img = new Image();
            img.addEventListener('load', onAssetLoad);
            img.addEventListener('error', onAssetLoad); // Count errors as loaded
            img.src = src;
        }
    });

    function onAssetLoad() {
        loadedCount++;
        // Hide loader when all assets are preloaded OR after 3 seconds max
        if (loadedCount >= totalAssets) {
            setTimeout(() => {
                showCoverAndHideLoader();
            }, 500);
        }
    }

    function showCoverAndHideLoader() {
        loader.classList.add('loaded');
        // Show cover page after loader starts hiding
        setTimeout(() => {
            cover.classList.add('show');
        }, 300);
    }

    // Fallback: Hide loader after 4 seconds max
    setTimeout(() => {
        showCoverAndHideLoader();
    }, 4000);

    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('mainContent');
    const openBtn = document.getElementById('openBtn');
    const bgMusic = document.getElementById('bgMusic');
    const guestNameEl = document.getElementById('guestName');
    const floatingNav = document.querySelector('.floating-nav');
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = musicToggle.querySelector('.material-symbols-rounded');

    // Music Control Logic
    let isMusicPlaying = false;
    let scrollTimeout;

    // Load music preference
    const savedMusicStatus = localStorage.getItem('musicStatus');
    if (savedMusicStatus === 'paused') {
        isMusicPlaying = false;
        musicIcon.textContent = 'volume_off';
    } else {
        isMusicPlaying = true;
        musicIcon.textContent = 'volume_up';
    }

    musicToggle.addEventListener('click', function() {
        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log('Playback failed'));
            musicIcon.textContent = 'volume_up';
            localStorage.setItem('musicStatus', 'playing');
            isMusicPlaying = true;
        } else {
            bgMusic.pause();
            musicIcon.textContent = 'volume_off';
            localStorage.setItem('musicStatus', 'paused');
            isMusicPlaying = false;
        }
    });

    // Auto-hide music button on scroll
    window.addEventListener('scroll', function() {
        if (!musicToggle.classList.contains('hidden')) {
            musicToggle.classList.add('scrolling');
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                musicToggle.classList.remove('scrolling');
            }, 1000); // Muncul kembali setelah 1 detik berhenti scroll
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        guestNameEl.textContent = guestName.replace(/\+/g, ' ');
    }

    // Function to open invitation (slide left)
    function openInvitation() {
        const savedStatus = localStorage.getItem('musicStatus');
        if (savedStatus !== 'paused') {
            bgMusic.play().catch(e => console.log('Audio autoplay blocked'));
        }
        
        // Show floating leaves
        const leaves = document.querySelectorAll('.floating-leaf');
        leaves.forEach(leaf => {
            leaf.style.display = 'block';
            leaf.style.opacity = '1';
        });
        
        cover.style.transform = 'translateX(-100%)';
        cover.style.opacity = '0';
        cover.style.pointerEvents = 'none';
        
        setTimeout(() => {
            cover.classList.add('hidden');
            mainContent.classList.remove('hidden');
            floatingNav.classList.remove('hidden');
            musicToggle.classList.remove('hidden'); // Show music button
            
            // Initialize scroll animations before showing elements
            initScrollAnimations();
            
            // Smooth zoom out animation for countdown page
            const countdownSection = document.getElementById('countdown');
            countdownSection.style.transition = 'none';
            countdownSection.style.transform = 'scale(1.2)';
            countdownSection.style.opacity = '0';
            
            setTimeout(() => {
                countdownSection.style.transition = 'transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.5s ease';
                countdownSection.style.transform = 'scale(1)';
                countdownSection.style.opacity = '1';
                
                // Manually trigger visible for elements in countdown on first load
                const firstElements = countdownSection.querySelectorAll('.scroll-animate');
                firstElements.forEach(el => el.classList.add('visible'));
            }, 50);
        }, 600);
    }

    // Open invitation on button click
    openBtn.addEventListener('click', openInvitation);

    const swipeOverlay = document.getElementById('swipeOverlay');
    
    // Touch swipe RIGHT
    let touchStartX = null;
    
    swipeOverlay.addEventListener('touchstart', function(e) {
        if (cover.classList.contains('hidden')) return;
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    swipeOverlay.addEventListener('touchend', function(e) {
        if (cover.classList.contains('hidden') || touchStartX === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        if (touchEndX - touchStartX > 30) { // Swipe to the right
            openInvitation();
        }
        touchStartX = null;
    }, { passive: true });
    
    // Mouse swipe for desktop
    let mouseStartX = null;
    
    swipeOverlay.addEventListener('mousedown', function(e) {
        if (cover.classList.contains('hidden')) return;
        mouseStartX = e.clientX;
    });
    
    swipeOverlay.addEventListener('mouseup', function(e) {
        if (cover.classList.contains('hidden') || mouseStartX === null) return;
        if (e.clientX - mouseStartX > 30) { // Swipe to the right
            openInvitation();
        }
        mouseStartX = null;
    });

    // 3. Music Auto-Pause/Play on Visibility Change
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            bgMusic.pause();
        } else {
            // Only resume if cover is already hidden (meaning user has opened invitation)
            // and music was not manually paused
            const savedStatus = localStorage.getItem('musicStatus');
            if (cover.classList.contains('hidden') && savedStatus !== 'paused') {
                bgMusic.play().catch(e => console.log('Playback failed'));
            }
        }
    });

    function initScrollAnimations() {
        const scrollElements = document.querySelectorAll('.scroll-animate');
        // Initialize lastScrollTop to current position
        let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Set default fade-up class for all elements initially
        scrollElements.forEach(el => {
            if (!el.classList.contains('fade-up') && !el.classList.contains('fade-down')) {
                el.classList.add('fade-up');
            }
        });

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // If scroll hasn't moved yet, default to scrolling down behavior (fade-up)
            const scrollingDown = currentScrollTop >= lastScrollTop;

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (scrollingDown) {
                        entry.target.classList.remove('fade-down');
                        entry.target.classList.add('fade-up');
                    } else {
                        entry.target.classList.remove('fade-up');
                        entry.target.classList.add('fade-down');
                    }
                    
                    void entry.target.offsetWidth;
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.remove('visible');
                }
            });
            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        }, observerOptions);

        scrollElements.forEach(el => observer.observe(el));

        // Initial check for elements already in view (using rAF for performance)
        requestAnimationFrame(() => {
            scrollElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('visible');
                }
            });
        });
    }

    // 4. Smooth Scroll for Navbar Icons (Provided Code)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(anchor => { 
        anchor.addEventListener('click', function (e) { 
            e.preventDefault(); 
            const targetId = this.getAttribute('href'); 
            const target = document.querySelector(targetId); 
            if (!target) return; 

            const navbarHeight = 20; 
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight; 
            const startPosition = window.pageYOffset; 
            const distance = targetPosition - startPosition; 
            const duration = 800; 
            let start = null; 

            function easeInOutCubic(t) { 
                return t < 0.5 
                    ? 4 * t * t * t 
                    : 1 - Math.pow(-2 * t + 2, 3) / 2; 
            } 

            function animationScroll(currentTime) { 
                if (start === null) start = currentTime; 
                const timeElapsed = currentTime - start; 
                const progress = Math.min(timeElapsed / duration, 1); 
                const ease = easeInOutCubic(progress); 

                window.scrollTo(0, startPosition + distance * ease); 

                if (timeElapsed < duration) { 
                    requestAnimationFrame(animationScroll); 
                } 
            } 
            requestAnimationFrame(animationScroll); 
        }); 
    });

    // 5. Logic to hide/show navbar on scroll
    let isScrolling;
    window.addEventListener('scroll', function() {
        if (cover.classList.contains('hidden')) {
            window.clearTimeout(isScrolling);
            floatingNav.classList.add('nav-hidden');
            isScrolling = setTimeout(function() {
                floatingNav.classList.remove('nav-hidden');
            }, 150);
        }
    }, false);

    // 6. Active Nav Update
    const sections = document.querySelectorAll('.section');
    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === '#' + current) {
                item.classList.add('active');
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav);

    // 7. Event Counter Animation
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                let current = 0;
                const duration = 1500;
                const stepTime = 20;
                const steps = duration / stepTime;
                const increment = target / steps;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        counter.innerText = target;
                        clearInterval(timer);
                    } else {
                        counter.innerText = Math.ceil(current);
                    }
                }, stepTime);
                
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.event-day-counter').forEach(el => counterObserver.observe(el));

    // 8. Countdown Timer
    const weddingDate = new Date('2026-07-16T10:00:00').getTime();
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) {
            const timerContainer = document.getElementById('countdownTimer');
            timerContainer.innerHTML = '<div class="event-finished">Acara telah selesai</div>';
            timerContainer.style.display = 'block';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // 9. Gift & RSVP & Wishes Logic
    const showRekeningBtn = document.getElementById('showRekening');
    const rekeningInfo = document.getElementById('rekeningInfo');
    if (showRekeningBtn) {
        showRekeningBtn.addEventListener('click', function() {
            rekeningInfo.classList.toggle('hidden');
            this.innerHTML = rekeningInfo.classList.contains('hidden')
                ? '<span class="material-symbols-rounded">account_balance</span> Buka Rekening Digital'
                : '<span class="material-symbols-rounded">visibility_off</span> Tutup';
        });
    }

    window.copyRekening = function() {
        const rekeningNumber = document.getElementById('rekeningNumber').textContent;
        navigator.clipboard.writeText(rekeningNumber).then(() => {
            alert('Nomor rekening berhasil disalin!');
        }).catch(err => { console.error('Failed to copy:', err); });
    };

    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const rsvpStatus = document.getElementById('rsvpStatus');
            rsvpStatus.innerHTML = '<p style="color: var(--primary);">Mengirim data...</p>';
            setTimeout(() => {
                rsvpStatus.innerHTML = '<p style="color: #2e7d32;">Terima kasih! Konfirmasi kehadiran Anda telah terkirim.</p>';
                rsvpForm.reset();
            }, 1500);
        });
    }

    const wishesForm = document.getElementById('wishesForm');
    if (wishesForm) {
        wishesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                status: formData.get('status'),
                message: formData.get('message')
            };
            const wishesList = document.getElementById('wishesList');
            const wishCard = document.createElement('div');
            wishCard.className = 'wish-card';
            wishCard.innerHTML = `<div class="wish-header"><span class="wish-name">${data.name}</span><span class="wish-status">${data.status}</span></div><p class="wish-text">${data.message}</p>`;
            wishesList.insertBefore(wishCard, wishesList.firstChild);
            wishesForm.reset();
            alert('Ucapan Anda berhasil terkirim!');
        });
    }

    // 10. Gallery zoom
    const galleryImages = document.querySelectorAll('.gallery-img');
    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            this.style.transform = this.style.transform === 'scale(1.1)' ? 'scale(1)' : 'scale(1.1)';
        });
    });
});