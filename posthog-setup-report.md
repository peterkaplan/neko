<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Neko game. Because this is a browser-based Phaser game (not a traditional server-side Node.js app), the integration uses the `posthog-node/edge` entrypoint — a fetch-based, browser-compatible build of the SDK — rather than the full Node.js entrypoint, which depends on Node.js-only APIs. A persistent anonymous distinct ID is stored in `localStorage` under the key `neko-player-id` so every event can be correlated across a player's session.

Ten events are captured across five files. A global error handler in `src/index.ts` captures unhandled exceptions and promise rejections via `captureException`. Webpack's `DefinePlugin` injects the PostHog key and host at build time from the project's `.env` file, so no secrets are hardcoded.

| Event name | Description | File |
|---|---|---|
| `game started` | Player starts a new game session from the main menu | `src/states/Start.ts` |
| `difficulty selected` | Player selects normal or hard difficulty before starting an endless game | `src/states/Start.ts` |
| `how to play viewed` | Player opens the How to Play instructions overlay | `src/states/Start.ts` |
| `player wall collision` | Player's cat hits a wall and loses a life | `src/objects/GameBoard.ts` |
| `level completed` | Player clears all jars and completes an endless mode level | `src/objects/GameBoard.ts` |
| `daily puzzle completed` | Player successfully completes today's daily puzzle | `src/objects/GameBoard.ts` |
| `game over` | Player runs out of lives and reaches the game-over screen | `src/states/GameOver.ts` |
| `endless high score set` | Player sets a new personal best score in endless mode | `src/states/GameOver.ts` |
| `game retried` | Player clicks Retry on the game-over screen to start a new run | `src/states/GameOver.ts` |
| `result shared` | Player shares their daily puzzle result via the native share sheet or clipboard | `src/states/DailyClear.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/497792/dashboard/1799250)
- [Daily Active Players](https://us.posthog.com/project/497792/insights/uD1zcuG0) — Unique players per day (DAU)
- [Game Mode Popularity](https://us.posthog.com/project/497792/insights/PYUoo7Kg) — Sessions broken down by daily vs endless
- [Endless Difficulty Split](https://us.posthog.com/project/497792/insights/dbqEqJYe) — Sessions broken down by normal vs hard
- [Daily Puzzle Completion Funnel](https://us.posthog.com/project/497792/insights/m4zmddBw) — Game started → Daily completed → Result shared
- [Player Wall Collisions & Game Over](https://us.posthog.com/project/497792/insights/N69J70sd) — Deaths and game-overs over time

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_API_KEY` and `POSTHOG_HOST` to `.env.example` (or equivalent) and any bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify correctly in PostHog Error Tracking.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-javascript_node/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
