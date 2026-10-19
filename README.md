# Quazar Labs

A public learning library for students in Grades 7–10, with a private founder editor. Built with React, TypeScript, Vinext, Cloudflare D1, and R2 using the Sites starter.

## Current state

- Home, course library, course curriculum, lesson pages, about, privacy, and a custom 404.
- Hackathon Foundations: Junior and Senior tracks, six modules and twelve planned lessons per track.
- All initial recordings are honestly marked **coming soon**. No placeholder videos are published.
- Private content editor at `/admin`: create, edit, reorder, preview, publish, and unpublish the course hierarchy; upload teaching files and founder images.
- Click-to-load YouTube embeds and downloadable PDF/PPT/PPTX materials.
- No student accounts, enquiries, payments, analytics, or advertised events.

The Git remote is `https://github.com/Silveroger/quazar_labs.git`. The website runs locally for review; hosting is configured separately from GitHub source control.

## Run locally

Requires Node.js 22.13+ and npm. Node 24 was used for the native TypeScript test runner.

```sh
npm ci
```

Copy `.env.example` to `.dev.vars`. Keep the local `ADMIN_USER_IDS=local_seedy` entry only for development. The supplied Sites integration simulates sign-in on loopback requests in the dev server; the mock does not ship in the production build.

Build once and apply the initial schema **once per fresh local database**:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_married_blink.sql
npm run dev -- --hostname 127.0.0.1
```

Open the URL printed by the dev server, normally `http://127.0.0.1:5173/`. The database and files persist in the ignored `.wrangler/state` directory. The launch curriculum is read from `lib/seed.ts` until the first editor save; subsequent edits are stored in D1.

If the Windows npm shim fails, run npm through its installed JavaScript entry point, for example `node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" run dev -- --hostname 127.0.0.1`.

## Using the founder editor

1. Open `/admin` and sign in. Locally, this uses the development identity. Hosted sign-in uses ChatGPT and checks the configured founder allowlist on the server.
2. Select a course, track, module, lesson, or founder in the left navigation.
3. Edit the fields and click **Save changes**. Use the up/down arrows to reorder items.
4. For a lesson, paste a YouTube video URL and upload its materials. Uploads save the current form first and then attach the file.
5. Use **Save & preview privately** to inspect draft content. Only authorised founders can access preview URLs and their files.
6. Set a lesson to **Published** and save when its recording is ready. A published lesson must have a valid YouTube ID. Ensure embedding is enabled for the video on YouTube.

### Visibility rules

- **Draft:** private, including all descendants when used on a course, track, or module.
- **Upcoming:** publicly visible curriculum. Upcoming lessons expose no video or downloads.
- **Published:** published lessons have a playable recording and may expose their resources.
- A public track becomes available automatically as soon as it contains a published lesson, even if its parent curriculum is marked upcoming.
- Unpublishing or hiding a parent blocks both lesson access and file downloads. Existing downloaded copies cannot be revoked.
- Removed file references become inaccessible publicly. Their objects remain stored, avoiding accidental irreversible deletion from the editor.

Files support PDF, PPT, and PPTX up to 25 MB. Photos support JPG, PNG, and WebP up to 25 MB. Extensions and signatures are validated server-side; resource references are checked against their owning lesson. Photos can be reverted to the initials placeholders.

Two editors saving the same revision receive a conflict rather than overwriting each other. On a conflict, keep a copy of unsaved text, reload, and apply it to the latest content.

## Implementation

- `app/` contains public pages, the editor, and server endpoints.
- `lib/content.ts` defines the validated document and its public projection; `lib/server.ts` handles D1 and founder identity.
- `components/admin-editor.tsx` edits the document; `db/schema.ts` and `drizzle/` version the database schema.

D1 stores one versioned course document plus asset metadata. R2 stores file bytes. A single document makes ordered curriculum edits atomic and straightforward for this small library. Each save uses optimistic revision checks.

The API surface is intentionally small:

| Endpoint | Behaviour |
| --- | --- |
| `GET /api/admin/content` | Authorised founder snapshot and revision |
| `PUT /api/admin/content` | Validated document update with expected revision |
| `POST /api/admin/upload` | Authorised multipart upload with `file`, `kind`, and `targetId` |
| `GET /api/files/:id` | Public only for referenced published material or founder photos; otherwise admin-only |

All mutations require founder authentication and same-origin requests. Request sizes are bounded. Draft APIs, editor pages, and files use private/no-store responses as appropriate. Native Sites dispatch must remain in front of the app in production because it supplies the trusted authentication identity.

## Verification

```sh
npm run typecheck
npm test
npm run test:integration
npm run build
```

Integration tests require the local dev server and its development admin identity. Run them only in a local test workspace with no other editor making changes. They temporarily publish a test lesson and upload a small fixture, verify access and downloads, then restore the original curriculum. The unreferenced fixture remains private in local storage.

The browser review covers the hero interaction, course navigation, track switching, module expansion, mobile layouts, editor saving, and private video previews. Real lecture playback still depends on the YouTube videos you eventually supply.

## Hosting after review

The source is ready for the Sites workflow. The site has not yet been registered or deployed.

1. Register the Site once and persist its returned `project_id` in `.openai/hosting.json`, retaining the `DB` and `BUCKET` bindings.
2. Configure production `ADMIN_EMAILS` with the founder account emails supplied in the chat, and `SITE_URL` with the real HTTPS origin. Do **not** copy `ADMIN_USER_IDS=local_seedy` into production.
3. Follow the Sites source/build/package workflow when hosting is requested.
4. Deploy and check the private version, verify real ChatGPT founder sign-in, then make the intended public site available.
5. Keep the GitHub source repository in sync with approved website changes.

No passwords or YouTube API keys are needed. The production allowlist is empty by default and denies admin access until configured.

## Assets

Illustrations, wordmark, and favicon are original CSS/SVG designs. Manrope and Inter are self-hosted; their Open Font Licences are in `public/fonts/`. Photos use initials until the founders upload real images. Social previews use `public/social.png`.
