# Statsforvalterens fellestjenester (STAF) redesign

Design proposal for statsforvalteren.no/staf. Static HTML, open `index.html` or serve the folder:

```bash
python3 -m http.server 4471
```

Pages: `index.html`, `oppgaver.html`, `avdelinger.html`, `strategi.html`, `jobb.html`, `nyheter.html`, `pukkellaks.html`.

- `assets/style.css`, `assets/main.js`: styles and motion (GSAP, ScrollTrigger, Lenis via CDN)
- `assets/img/`: STAF's own photos (Foto: Bård Gudim / STAF) and strategy illustration
- `assets/gen/`: graphics and hero video generated with Higgsfield

Fonts: the design uses Maison Neue (Light, Book, Medium, Demi), which is a licensed font and is not included here. Place `MaisonNeue-Light.otf`, `MaisonNeue-Book.otf`, `MaisonNeue-Medium.otf` and `MaisonNeue-Demi.otf` in `assets/fonts/`. Without them the site falls back to Helvetica Neue.

This is a design proposal, not the official website.
