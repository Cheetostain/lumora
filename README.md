Lumora, https://lumorafl.com. Static site in English (/) and Spanish (/es/), published with GitHub Pages.

**Oct 7, 2026: the English main pages now run the new design (v3).** Home, How it works, About, Industries and the 8 trade pages, Contact and Leak check were copied from `design-research/design-team-2026-10` by its `golive.py`; their styles and scripts are in `v3/`. Spanish pages, articles, privacy, met, hi and the 404 still use the old look. Do not run the old `_build` for English until it is moved onto the v3 system, or it puts the old pages back. To refresh the English pages from the design team, rerun `golive.py`.


The pages are generated. Do not edit the .html files, sitemap.xml or robots.txt by hand: the next build overwrites them. Styles are in assets/site.css and the shared script in assets/site.js. The brand artwork the pages use (the icons, Flight lines, the Bone grain, the bird on the 404, the Bold font and the email signature's lockup in email/) is copied from the brand files by the site's asset step, then the pages are built and checked.
