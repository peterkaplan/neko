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
        // Chrome rejects AudioContext.resume() on tab focus when no audio
        // output is usable (unplugged headphones, remote desktop). Handled
        // in index.ts and self-heals on the next tap — pure noise here.
        before_send: (event) => {
            if (event?.event === '$exception') {
                const exceptions: Array<{ value?: string }> = event.properties?.$exception_list ?? [];
                if (exceptions.some(e => /failed to start the audio device/i.test(e?.value ?? ''))) {
                    return null;
                }
            }
            return event;
        },
    });
}

// Same call shape the PostHog wizard generated at the call sites; posthog-js
// manages the player's identity itself, so distinctId is informational only.
export const posthog = {
    capture(payload: { distinctId?: string; event: string; properties?: Record<string, unknown>; instant?: boolean }): void {
        if (!enabled) return;
        // instant: skip the batch queue and send via beacon, for events fired
        // right before the player leaves (a mobile share, say) — a queued
        // event dies with the tab if the app is switched away immediately
        posthogJs.capture(payload.event, payload.properties, payload.instant
            ? { transport: 'sendBeacon', send_instantly: true }
            : undefined);
    },
};

export const distinctId = enabled ? posthogJs.get_distinct_id() : 'anonymous';
