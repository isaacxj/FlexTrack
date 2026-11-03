# FlexTrack

A personal gym and body-weight tracker, self-hosted on my own server and used from my phone.

FlexTrack is a fork of [openGym](https://github.com/DuarteSantos8/openGym) by Duarte Santos,
tailored to how I train. Everything openGym does, FlexTrack does: routines over a library of
5,600+ exercises with animated demos, guided sessions with a rest timer, progression rules, PRs
and 1RM estimates, a muscle map, body-weight tracking, passkey sign-in, offline use and sync.

## What's different from openGym

| | openGym | FlexTrack |
|---|---|---|
| Weight unit | kg or lb, your choice | **Pounds only.** New profiles start in lb; a profile in kg is converted once, every stored weight with it |
| Name | openGym | FlexTrack (app, page title, home-screen label, passkey prompt) |
| Android APK / App Store links | Offered in Settings | Hidden: those install upstream's app, not this one |

Both differences sit behind a switch, so upstream's code and tests stay untouched and new openGym
releases merge cleanly:

- `frontend/src/lib/lb-only.js`: pounds only. `VITE_ANY_UNIT=1` brings back the kg/lb choice.
- `frontend/src/lib/brand.js`: the app name. Every translated string goes through `t()`, which
  swaps "openGym" for `APP_NAME`, so none of the 20 language packs needed editing.

The test suite runs with both switches set back to upstream (`frontend/vite.config.js`), so
openGym's own tests keep checking openGym's behaviour, and FlexTrack's own tests
(`useStore.lb-only.test.jsx`, `brand.test.js`) check FlexTrack's.

## Running it

It runs as two containers (`api` and `web`) with its data in `./data`, on a server reached over
Tailscale.

```bash
# Build the images from this repo
docker build -t flextrack-api:latest --target default api
docker build -t flextrack-web:latest -f web/Dockerfile .

# Deploy: a docker-compose.yml whose image: lines name those two images, and a .env
cp .env.example .env    # then set RP_ID and ORIGIN to the address the phone uses
docker compose up -d --no-build
```

The web container listens on `127.0.0.1:8080` only, and Tailscale serves it over HTTPS on the
tailnet (passkeys need HTTPS):

```bash
sudo tailscale serve --bg --https=8443 http://127.0.0.1:8080
```

with, in `.env`:

```
RP_ID=<machine>.<tailnet>.ts.net
ORIGIN=https://<machine>.<tailnet>.ts.net:8443
WEB_PORT=127.0.0.1:8080
RP_NAME=FlexTrack
```

On the phone, open the `ORIGIN` address with Tailscale connected, create a profile, and use
**Add to Home Screen**. With `FIRST_USER_ADMIN=1`, the first profile on an empty instance becomes
its admin.

**Back up `./data`.** It holds every profile, workout and setting. The files belong to the
container's user, so copy them through Docker:

```bash
docker run --rm -v "$PWD/data":/data:ro -v "$HOME":/out alpine tar czf /out/flextrack-data.tgz -C / data
```

The [self-hosting guide](docs/SELF_HOSTING.md) and the rest of [docs/](docs/README.md) are
openGym's and apply here unchanged.

## Development

Tests and builds need Node 22. Without Node on the host, run them in a container:

```bash
docker run --rm -u $(id -u):$(id -g) -e HOME=/tmp -v "$PWD":/src -w /src/frontend node:22 \
  bash -c "npm ci && npx vitest run && node scripts/check-locales.mjs && node scripts/check-source-strings.mjs --strict && npm run build"
```

[CLAUDE.md](CLAUDE.md) has the map of the codebase and the full list of checks.

## Staying up to date with openGym

`upstream` is openGym:

```bash
git fetch upstream
git merge upstream/main
```

Then run the tests, rebuild the images and `docker compose up -d`.

## License and credits

FlexTrack is built on [openGym](https://github.com/DuarteSantos8/openGym) by Duarte Santos. If it
is useful to you, support that project: [Buy Me a Coffee](https://buymeacoffee.com/duartesantos),
[Ko-fi](https://ko-fi.com/opengym) or [GitHub Sponsors](https://github.com/sponsors/DuarteSantos8).

The code is licensed under the [GNU AGPL v3.0](LICENSE), like openGym's. Anyone using a running
FlexTrack can get its source from this repository (Settings links to it).

**The exercise media is not covered by that license.** The stills and animations are
© Aliaksandr Makatserchyk, [Gym visual](https://gymvisual.com/), licensed for use in openGym only;
a non-commercial fork may keep them unmodified with this notice. Third-party notices are in
[NOTICE.md](NOTICE.md).
