---
title: PokéSearch
desc: Flask web app that queries the PokéAPI to surface Pokémon stats — height, weight, base XP, abilities, types, and moves — with audio cries triggered on hover.
tags: [{"label":"Flask","color":"green"},{"label":"Python","color":"green"},{"label":"REST API","color":"purple"},{"label":"Jinja2","color":"green"},{"label":"Bootstrap","color":"green"}]
filters: ["Web Dev", "Python"]
youtube: 3IfHZCVvMD8
demo: https://youtu.be/3IfHZCVvMD8
github: https://github.com/IndraNeelMulakaloori/PokeSearch
---

## overview

PokéSearch is a Pokémon search engine built with Flask that fetches live data from the [PokéAPI](https://pokeapi.co/api/v2/) on every query. Search any Pokémon by name and get its stats — height, weight, base experience, abilities, types, and first 5 moves — rendered on a card. A small JS snippet triggers the Pokémon's official cry audio when the cursor hovers over its sprite.

## architecture

The app follows Flask's application factory pattern (`create_app()`) with a blueprint (`main`) separating routing from the app initialization. On a `POST` to `/result`, the `fetchResult` function hits the PokéAPI endpoint, extracts the relevant fields via `stripData`, and passes the structured dict to `result.html` via Jinja2 template rendering. If the Pokémon doesn't exist (404 from the API), a default error response with a placeholder image is returned instead of crashing.

## stack

- **Flask** — WSGI app factory, blueprint routing
- **PokéAPI** — free REST API for all Pokémon data
- **Jinja2** — template engine for dynamic HTML rendering
- **Bootstrap** — navbar, form controls, card component
- **Deployed** on [Render](https://pokesearch-mhgv.onrender.com)

## key learnings

Built while learning REST APIs — attended MLH Global Hack Week: API Week to accelerate understanding of `GET`/`POST`, endpoints, and response parsing. First project using production-level Flask patterns (factory function, blueprints, virtual env).
