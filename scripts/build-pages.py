#!/usr/bin/env python3
"""Writes the small HTML shells for every place, public and on-property, and the act shells.
Content lives in site/assets/js/dome-data.js; these files only say which place to render.
Run from the repo root: python3 scripts/build-pages.py"""
import os

SLUGS = ["gate", "window", "couch", "library", "table", "loft", "hearth", "cedar-pool",
         "fire-circle", "meadow", "trails", "night-sky", "guest-book"]

SHELL = """<!doctype html>
<html lang="en" data-season="summer">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Catskill Mountain Domes</title>
<link rel="stylesheet" href="{root}assets/css/dome.css">
</head>
<body data-root="{root}" data-page="{page}" data-place="{slug}" data-mode="{mode}">
<main id="main"></main>
<script src="{root}assets/js/dome-data.js"></script>
<script src="{root}assets/js/place.js"></script>
<script src="{root}assets/js/dome.js"></script>
</body>
</html>
"""

def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(text)

for s in SLUGS:
    write(f"site/places/{s}.html", SHELL.format(root="../", page="places/index.html", slug=s, mode="public"))
    write(f"site/house/places/{s}.html", SHELL.format(root="../../", page="", slug=s, mode="house"))

ACT = """<!doctype html>
<html lang="en" data-season="summer">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#060a06">
<title>The Awakening · Act {n}</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="stylesheet" href="../../assets/css/dome.css">
<link rel="stylesheet" href="awakening.css">
</head>
<body data-root="../../" data-bare="1" data-act="{n}">
<main id="act"></main>
<script src="../../assets/js/dome-data.js"></script>
<script src="awakening-data.js"></script>
<script src="awakening.js"></script>
<script src="../../assets/js/dome.js"></script>
</body>
</html>
"""
for n in range(0, 8):
    write(f"site/house/awakening/act-{n}.html", ACT.format(n=n))
print("shells written")
