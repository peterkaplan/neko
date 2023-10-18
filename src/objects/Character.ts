import Phaser from 'phaser';
import { TILE_SIZE, SCALE_RATIO, OFFSET, MAX_VELOCITY, LEFT_MARGIN, TOP_MARGIN  } from '../utils/Constants';
import { GAME_STATE } from '../utils/GameState';

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

        const xPosition = this.x * TILE_SIZE + LEFT_MARGIN + SCALE_RATIO * CHARACTER_SIZE / 2;
        const yPosition = this.y * TILE_SIZE + TOP_MARGIN  + SCALE_RATIO * CHARACTER_SIZE / 2;
        console.log(xPosition, yPosition);
    
        if(!this.sprite) {
            this.sprite = this.scene.physics.add.sprite(xPosition, yPosition, 'character');
        } else {
            this.sprite.setPosition(xPosition, yPosition);
        }

        this.sprite.setScale(0); // Start scaled down
        this.sprite.setAlpha(0); // Start transparent
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.setDepth(1);
    
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
                console.log("onComplete");
                this.enableMovement();
                GAME_STATE.currentlyColliding = false;
            }
        });

        this.scene.emitter.startFollow(this.sprite);

    }
    

    move(direction: 'left' | 'right' | 'up' | 'down'): void {
        if (!GAME_STATE.canPlayerMove) {
            return;
        }

        GAME_STATE.canPlayerMove = false;

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
        this.sprite.setPosition(this.x * TILE_SIZE + LEFT_MARGIN + OFFSET, this.y * TILE_SIZE + TOP_MARGIN + OFFSET);
    }

    handleBoxCollision(box: any): void {
        this.stopMovement();
    
        const targetX = box.x * TILE_SIZE + OFFSET + LEFT_MARGIN;
        const targetY = box.y * TILE_SIZE + OFFSET + TOP_MARGIN;
    
        this.moveToPosition(targetX, targetY, (tween: Phaser.Tweens.Tween, targets: any[]) => {
            this.scene.emitter.explode(10, this.scene.emitter.x, this.scene.emitter.y);
            console.log("onComplete1");
            // this conflicts with # of boxes 
            this.enableMovement();
        });
    }
    
    private stopMovement(): void {
        this.sprite.setVelocity(0, 0);
        GAME_STATE.canPlayerMove = false;
    }

    private enableMovement(): void {
        if (GAME_STATE.boxes.length === 0) {
            return;
        }
        GAME_STATE.canPlayerMove = true;
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
        GAME_STATE.currentlyColliding = true;

        // Play a bounce-back effect using a tween
        this.scene.tweens.add({
            targets: this.sprite,
            yoyo: true, // This will make the tween play backward after it finishes, creating the bounce-back effect
            duration: 400, // Adjust duration as needed
            scaleX: this.sprite.scaleX * 1.2, // Scale up
            scaleY: this.sprite.scaleY * 1.2, // Scale up
            onComplete: () => {
                this.sprite.clearTint(); // Clear the tint after the animation
                GAME_STATE.currentlyColliding = false;
            }
        });
    
        // Tint the sprite to give feedback of getting "hurt"
        this.sprite.setTint(0xff0000); // Red tint
    }

    public winEffect(): void {
        // Stop any ongoing movement
        this.stopMovement();
        GAME_STATE.currentlyColliding = true;

        // Flash between a golden color (for victory) and normal color
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0.5, // Tween the alpha for a flashing effect
            duration: 100, // Adjust duration for the flash rate
            repeat: 5, // Repeat 5 times for a flash effect
            yoyo: true,
            onStart: () => {
                console.log("onStart");
                this.sprite.setTint(0xffd700); // Golden tint
                console.log( GAME_STATE.canPlayerMove);
            },
            onYoyo: () => {
                this.sprite.clearTint();
                console.log( GAME_STATE.canPlayerMove);

            },
            onRepeat: () => {
                this.sprite.setTint(0xffd700); // Golden tint
            },
            onComplete: () => {
                this.sprite.clearTint(); // Clear the tint after the animation
                this.sprite.alpha = 1; // Reset the alpha to its original value

            }
        });
    }
}

export default Character;
