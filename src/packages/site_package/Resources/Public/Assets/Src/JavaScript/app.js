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

document.addEventListener('DOMContentLoaded', async () => {
    initHeroCarousel();
    const players = await initPodcastPlayers();
    await initPodcastSliders(players);
});
