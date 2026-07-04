import posthogJs from 'posthog-js';

declare const process: { env: { POSTHOG_API_KEY?: string; POSTHOG_HOST?: string } };

// The key is a public client token injected at build time; without one
// (e.g. a local build with no .env) analytics silently no-op.
const apiKey = process.env.POSTHOG_API_KEY;
const enabled = Boolean(apiKey);

if (enabled) {
    posthogJs.init(apiKey!, {
        api_host: process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com',
        // Canvas game: there's no DOM to autocapture, events are explicit
        autocapture: false,
        capture_pageview: true,
        capture_exceptions: true,
    });
}

// Same call shape the PostHog wizard generated at the call sites; posthog-js
// manages the player's identity itself, so distinctId is informational only.
export const posthog = {
    capture(payload: { distinctId?: string; event: string; properties?: Record<string, unknown> }): void {
        if (!enabled) return;
        posthogJs.capture(payload.event, payload.properties);
    },
};

export const distinctId = enabled ? posthogJs.get_distinct_id() : 'anonymous';
