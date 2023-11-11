import { GAME_STATE,  } from "../utils/GameState";

export class Scoreboard {

    private scoreText: Phaser.GameObjects.Text;
    private lives: Phaser.GameObjects.Text;
    private level: Phaser.GameObjects.Text;

    constructor(private scene: Phaser.Scene) {

        this.scoreText = scene.add.text(158, 537, GAME_STATE.score.toString(), {
            fontFamily: 'PixelFont',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
        });
    
        this.lives = scene.add.text(158, 562, GAME_STATE.lives.toString(), {
            fontFamily: 'PixelFont',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
        });
    
        this.level = scene.add.text(158, 585, GAME_STATE.currentLevel.toString(), {
            fontFamily: 'PixelFont',
            fontSize: '14px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
        });
    }
    
    public update(): void {
        this.scoreText.setText(GAME_STATE.score.toString());
        this.lives.setText(GAME_STATE.lives.toString());
        this.level.setText(GAME_STATE.currentLevel.toString());
    }
}

export default Scoreboard;