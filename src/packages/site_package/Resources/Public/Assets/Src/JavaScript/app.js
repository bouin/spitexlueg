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

document.addEventListener('DOMContentLoaded', async () => {
    initHeroCarousel();
    initAccordions();
    initBenefitTiles();
    initMaps();
    const players = await initPodcastPlayers();
    await initPodcastSliders(players);
});
