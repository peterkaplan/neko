import Phaser from 'phaser'

const WHITE = 0xffffff
const BLACK = 0x353535
const GREEN = 0x38761D

export default class Button extends Phaser.GameObjects.Image
{
	private upTexture: string
	private upTint: number
	private downTexture: string
	private downTint: number
	private overTexture: string
	private overTint: number
	private disabledTexture: string
	private disabledTint: number
    private outTexture: string
    private outTint: number
    private callBack: Function;

	constructor(scene: Phaser.Scene, x: number, y: number, texture: string, tint: number = WHITE, callback: Function)
	{
		super(scene, x, y, texture)

		this.setTint(tint)
		this.upTexture = texture
		this.upTint = GREEN
		this.downTexture = texture
		this.downTint = BLACK
		this.overTexture = texture
		this.overTint = BLACK
		this.disabledTexture = texture
		this.disabledTint = BLACK
        this.outTexture = texture
        this.outTint = tint
        this.callBack = callback;
        
		this.setInteractive()
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.handleUp, this)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this.handleOut, this)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.handleDown, this)
			.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this.handleOver, this)
	}

	setUpTexture(texture: string)
	{
        console.log("happening");
		this.upTexture = texture
		return this
	}

	setUpTint(tint: number)
	{
		this.upTint = tint
		return this
	}

	setDownTexture(texture: string)
	{
		this.downTexture = texture
		return this
	}

	setDownTint(tint: number)
	{
		this.downTint = tint
		return this
	}

	setOverTexture(texture: string)
	{
		this.overTexture = texture
		return this
	}

	setOverTint(tint: number)
	{
		this.overTint = tint
		return this
	}

	setDisabledTexture(texture: string)
	{
		this.disabledTexture = texture
		return this
	}

	setDisabledTint(tint: number)
	{
		this.disabledTint = tint
		return this
	}

	setDisabled(disabled: boolean)
	{
		if (disabled)
		{
			this.setTexture(this.disabledTexture)
			this.setTint(this.disabledTint)
			this.disableInteractive()
			return this
		}

		this.setTexture(this.upTexture)
		this.setTint(this.disabledTint)
		this.setInteractive()

		return this
	}

	private handleUp(pointer: Phaser.Input.Pointer)
	{
		this.setTexture(this.upTexture)
		this.setTint(this.upTint)
        this.callBack();
	}

	private handleOut(pointer: Phaser.Input.Pointer) {
		this.setTexture(this.outTexture)
		this.setTint(this.outTint) 
        console.log("out");
    }

	private handleDown(pointer: Phaser.Input.Pointer)
	{
		this.setTexture(this.downTexture)
		this.setTint(this.downTint)
	}

	private handleOver(pointer: Phaser.Input.Pointer)
	{
		this.setTexture(this.overTexture)
		this.setTint(this.overTint)
	}
}