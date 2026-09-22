// Ad engine — fetches and renders ads for each [data-ad-slot] element.
// Mirrors skrottorget.se's ads.ts pattern: data-site targeting + API fetch.

(function () {
  const SITE = 'europeanscrapmarket.com';
  document.documentElement.dataset.site = SITE;

  async function loadAd(el: HTMLElement) {
    const slot = el.dataset.adSlot;
    const placement = el.dataset.adPlacement || 'inline';
    if (!slot) return;

    // Detect country from URL path if on a country page
    const pathMatch = window.location.pathname.match(/\/sell-scrap\/([^/]+)/);
    const country = pathMatch ? pathMatch[1] : undefined;

    const params = new URLSearchParams();
    if (country) params.set('country', country);

    try {
      const res = await fetch(`/api/ads/${slot}?${params}`);
      const data = await res.json();
      if (!data.ad) {
        // No active ad — show nothing (or Google AdSense fallback)
        el.innerHTML = '';
        return;
      }

      const ad = data.ad;
      el.innerHTML = `
        <a href="${ad.target_url}" target="_blank" rel="noopener sponsored"
           class="ad-link block border border-[var(--color-line)] bg-white p-3 hover:border-[var(--color-accent)] transition"
           data-ad-id="${ad.id}">
          ${ad.image_url
            ? `<img src="${ad.image_url}" alt="${ad.advertiser_name}" class="mb-2 w-full" loading="lazy" />`
            : ''
          }
          ${ad.text
            ? `<p class="text-xs text-[var(--color-ink)]">${ad.text}</p>`
            : `<p class="mono text-xs text-[var(--color-faint)]">${ad.advertiser_name}</p>`
          }
        </a>`;

      // Track clicks
      const link = el.querySelector('a');
      link?.addEventListener('click', () => {
        fetch(`/api/ads/${slot}/click`, { method: 'POST' }).catch(() => {});
      });
    } catch {
      el.innerHTML = '';
    }
  }

  function init() {
    document.querySelectorAll('[data-ad-slot]').forEach((el) => {
      loadAd(el as HTMLElement);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
