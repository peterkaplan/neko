import Phaser from 'phaser';

// Mute survives reloads; the sound manager is game-global, so applying it
// once per scene entry keeps every scene in sync
const KEY = 'neko-muted';

export function isMuted(): boolean {
    try {
        return localStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
}

export function applyMute(scene: Phaser.Scene): void {
    scene.sound.mute = isMuted();
}

export function toggleMute(scene: Phaser.Scene): boolean {
    const muted = !scene.sound.mute;
    scene.sound.mute = muted;
    try {
        localStorage.setItem(KEY, muted ? '1' : '0');
    } catch {
        // storage unavailable — mute still works for this session
    }
    return muted;
}
