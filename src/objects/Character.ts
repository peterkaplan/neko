import Phaser from 'phaser';
import { TILE_SIZE, SCALE_RATIO, OFFSET, MAX_VELOCITY } from '../utils/Constants';

const CHARACTER_SIZE = 225; // Extracted this value to a constant for clarity.

export class Character {
    private scene: Phaser.Scene; // Use Phaser.Scene type for better type checking.
    private x: number;
    private y: number;
    public sprite!: Phaser.Physics.Arcade.Sprite;
    public isMoving: boolean = true;
    public isColliding: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.x = 0;
        this.y = 0;
    }

    public initSprite(startX: number, startY: number): void {
        this.x = startX;
        this.y = startY;

        const xPosition = this.x * TILE_SIZE + SCALE_RATIO * CHARACTER_SIZE / 2;
        const yPosition = this.y * TILE_SIZE + SCALE_RATIO * CHARACTER_SIZE / 2;
    
        if(!this.sprite) {
            this.sprite = this.scene.physics.add.sprite(xPosition, yPosition, 'character');
        } else {
            this.sprite.setPosition(xPosition, yPosition);
        }

        this.sprite.setScale(0); // Start scaled down
        this.sprite.setAlpha(0); // Start transparent
        this.sprite.setOrigin(0.5, 0.5);
    
        // Now, let's add the spawning animation
        this.scene.tweens.add({
            targets: this.sprite,
            scaleX: SCALE_RATIO,
            scaleY: SCALE_RATIO,
            alpha: 1,
            angle: 360, // Rotate by 360 degrees (full circle) for a quick twist effect
            duration: 500, // Duration for the entire animation, you can adjust as needed
            ease: 'Sine.easeOut', // Smooth easing function for a more polished look
            onComplete: () => {
                // Set the rotation back to its original state after the animation
                this.sprite.setRotation(0);
            }
        });

        this.scene.getEmittor().startFollow(this.sprite);
        this.isMoving = false;
    }
    

    move(direction: 'left' | 'right' | 'up' | 'down'): void {
        if (this.isMoving) {
            return;
        }

        this.isMoving = true;

        const velocityMap = {
            left: { x: -MAX_VELOCITY, y: 0, rotation: 0 },
            right: { x: MAX_VELOCITY, y: 0, rotation: 0 },
            up: { x: 0, y: -MAX_VELOCITY, rotation: -Math.PI / 2 },
            down: { x: 0, y: MAX_VELOCITY, rotation: Math.PI / 2 }
        };

        const { x, y, rotation } = velocityMap[direction];
        this.sprite.setVelocity(x, y);
        this.sprite.rotation = rotation;
    }

    getPosition(): { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.sprite.setPosition(this.x * TILE_SIZE + OFFSET, this.y * TILE_SIZE + OFFSET);
    }

    handleBoxCollision(box: any): void {
        this.stopMovement();
    
        const targetX = box.x * TILE_SIZE + OFFSET;
        const targetY = box.y * TILE_SIZE + OFFSET;
    
        this.moveToPosition(targetX, targetY, (tween: Phaser.Tweens.Tween, targets: any[]) => {
            this.scene.emitter.explode(10, this.scene.emitter.x, this.scene.emitter.y);
            this.setPosition(box.x, box.y);
            this.isMoving = false;
        });
    }
    
    private stopMovement(): void {
        this.sprite.setVelocity(0, 0);
    }
    
    private moveToPosition(x: number, y: number, onComplete: (tween: Phaser.Tweens.Tween, targets: any[]) => void): void {
        this.scene.tweens.add({
            targets: this.sprite,
            x: x,
            y: y,
            duration: 140,
            onComplete: onComplete
        });
    }

    public collisionEffect(): void {
        // Stop any ongoing movement
        this.stopMovement();
        
        // Play a bounce-back effect using a tween
        this.scene.tweens.add({
            targets: this.sprite,
            yoyo: true, // This will make the tween play backward after it finishes, creating the bounce-back effect
            duration: 500, // Adjust duration as needed
            scaleX: this.sprite.scaleX * 1.2, // Scale up
            scaleY: this.sprite.scaleY * 1.2, // Scale up
            onComplete: () => {
                this.sprite.clearTint(); // Clear the tint after the animation
                this.isColliding = false;
            }
        });
    
        // Tint the sprite to give feedback of getting "hurt"
        this.sprite.setTint(0xff0000); // Red tint
    }
    
    
}

export default Character;
