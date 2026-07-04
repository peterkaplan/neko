import 'phaser';

declare module 'phaser' {
    interface Scene {
        emitter: any; // Use a more specific type if you have one
    }
}
