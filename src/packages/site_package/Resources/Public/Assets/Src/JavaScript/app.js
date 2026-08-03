import '../Css/app.css';

/**
 * Hero carousel: cross-fades the images of the page's "Media" field.
 * Markup: <div data-hero-carousel> with .hero__slide children, one .is-active.
 */
function initHeroCarousel() {
    document.querySelectorAll('[data-hero-carousel]').forEach((carousel) => {
        const slides = carousel.querySelectorAll('.hero__slide');
        if (slides.length < 2) {
            return;
        }

        // Respect users who asked for reduced motion.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const interval = parseInt(carousel.dataset.heroCarousel, 10) || 6000;
        let current = 0;

        setInterval(() => {
            slides[current].classList.remove('is-active');
            current = (current + 1) % slides.length;
            slides[current].classList.add('is-active');
        }, interval);
    });
}

/**
 * Podcast players: every <video data-podcast-player> becomes a video.js player.
 * While a podcast plays, the label and the claim overlay are faded out.
 *
 * video.js is loaded on demand, so pages without podcasts stay light.
 */
async function initPodcastPlayers() {
    const elements = document.querySelectorAll('[data-podcast-player]');
    if (!elements.length) {
        return [];
    }

    const [{ default: videojs }] = await Promise.all([
        import('video.js'),
        import('video.js/dist/video-js.css'),
    ]);

    const players = [];

    elements.forEach((element) => {
        const player = videojs(element, {
            fluid: false,
            controls: true,
            preload: 'none',
            bigPlayButton: true,
        });

        const stage = element.closest('.podcast__stage');

        player.on('play', () => {
            // Only one podcast at a time.
            players.forEach((other) => {
                if (other !== player && !other.paused()) {
                    other.pause();
                }
            });
            stage?.classList.add('is-playing');
        });

        player.on('pause', () => stage?.classList.remove('is-playing'));
        player.on('ended', () => stage?.classList.remove('is-playing'));

        players.push(player);
    });

    return players;
}

/**
 * Podcast slider (Swiper). Only runs when the element holds more than one
 * episode — a single episode renders without navigation and stays static.
 */
async function initPodcastSliders(players) {
    const sliders = document.querySelectorAll('[data-podcast-swiper]');
    if (!sliders.length) {
        return;
    }

    const [{ default: Swiper }, { Navigation, Keyboard, A11y }] = await Promise.all([
        import('swiper'),
        import('swiper/modules'),
        import('swiper/css'),
    ]);

    sliders.forEach((element) => {
        const frame = element.closest('[data-podcast-slider]');
        const prev = frame?.querySelector('[data-podcast-prev]');
        const next = frame?.querySelector('[data-podcast-next]');

        if (!prev || !next) {
            return;
        }

        new Swiper(element, {
            modules: [Navigation, Keyboard, A11y],
            slidesPerView: 1,
            speed: 500,
            navigation: {
                prevEl: prev,
                nextEl: next,
                disabledClass: 'is-disabled',
            },
            keyboard: { enabled: true },
            a11y: {
                prevSlideMessage: 'Vorherige Folge',
                nextSlideMessage: 'Nächste Folge',
            },
            on: {
                // Leaving a slide stops whatever was playing on it.
                slideChange() {
                    players.forEach((player) => {
                        if (!player.paused()) {
                            player.pause();
                        }
                    });
                },
            },
        });
    });
}

/**
 * Accordions: each item toggles on its own; opening one does not close others.
 * The height animation is pure CSS (grid-template-rows), JS only flips a class.
 */
function initAccordions() {
    document.querySelectorAll('[data-accordion-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const item = button.closest('.accordion__item');
            if (!item) {
                return;
            }
            const open = item.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });
}

/**
 * Benefit tiles: the button flips the tile open/closed. The slide, morph and
 * text reveal are pure CSS transitions; JS only toggles the state class.
 */
function initBenefitTiles() {
    document.querySelectorAll('[data-tile-toggle]').forEach((button) => {
        button.addEventListener('click', () => {
            const tile = button.closest('.tile');
            if (!tile) {
                return;
            }
            const open = tile.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    });
}

/**
 * Standorte map: clicking a pin shows its card in the fixed slot; clicking the
 * active pin again (or the close button) hides it. Nothing is open initially.
 */
function initMaps() {
    document.querySelectorAll('.map').forEach((map) => {
        const pins = map.querySelectorAll('[data-map-pin]');
        const cards = map.querySelectorAll('[data-map-card]');

        const hideAll = () => {
            cards.forEach((card) => { card.hidden = true; });
            pins.forEach((pin) => pin.classList.remove('is-active'));
        };

        const show = (n) => {
            cards.forEach((card) => { card.hidden = card.dataset.mapCard !== n; });
            pins.forEach((pin) => pin.classList.toggle('is-active', pin.dataset.mapPin === n));
        };

        pins.forEach((pin) => {
            pin.addEventListener('click', () => {
                const n = pin.dataset.mapPin;
                if (pin.classList.contains('is-active')) {
                    hideAll();
                } else {
                    show(n);
                }
            });
        });

        map.querySelectorAll('[data-map-close]').forEach((btn) => {
            btn.addEventListener('click', hideAll);
        });
    });
}

/**
 * Application form pre-select. The "Bewerbungsformular" buttons carry the job
 * title in data-stelle. On the home page a click scrolls to #bewerben and
 * pre-selects the Powermail "Stelle" dropdown (no reload); from a subpage the
 * button links to /?stelle=<job>#bewerben and this runs on load.
 */
function initApplyPrefill() {
    const select = () => document.getElementById('powermail_field_stelle');

    const pick = (title) => {
        const sel = select();
        if (!sel || !title) {
            return;
        }
        for (let i = 0; i < sel.options.length; i++) {
            if (sel.options[i].value === title) {
                sel.selectedIndex = i;
                return;
            }
        }
    };

    const scrollToForm = () => {
        const target = document.getElementById('bewerben');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Confirmation flash: briefly turn the pill green so the user notices the
    // value was pre-selected, then it eases back to blue (CSS transition).
    const flash = () => {
        const sel = select();
        if (!sel) {
            return;
        }
        sel.classList.add('powermail_select--flash');
        window.setTimeout(() => sel.classList.remove('powermail_select--flash'), 1400);
    };

    // Pre-select, scroll there, then flash once it has scrolled into view.
    const apply = (title) => {
        pick(title);
        scrollToForm();
        window.setTimeout(flash, 500);
    };

    // Cross-page: #stelle=<job> in the hash (arrived from a subpage). A hash is
    // never sent to the server, so it avoids the query-param 404 on the home page.
    const match = window.location.hash.match(/stelle=([^&]+)/);
    if (match) {
        apply(decodeURIComponent(match[1].replace(/\+/g, ' ')));
    }

    // Same-page: intercept so we scroll + pre-select without a reload.
    document.querySelectorAll('a[data-stelle]').forEach((link) => {
        link.addEventListener('click', (e) => {
            if (!select()) {
                return; // form not on this page → let the href navigate
            }
            e.preventDefault();
            apply(link.getAttribute('data-stelle'));
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initHeroCarousel();
    initAccordions();
    initBenefitTiles();
    initMaps();
    initApplyPrefill();
    const players = await initPodcastPlayers();
    await initPodcastSliders(players);
});
