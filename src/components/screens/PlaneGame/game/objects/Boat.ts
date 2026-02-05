
import Phaser from 'phaser';
import { CONSTANTS } from '../constants';

export class Boat extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number) {
        const horizonY = CONSTANTS.HORIZON_Y + CONSTANTS.BOAT.Y_OFFSET;
        super(scene, x, horizonY, CONSTANTS.ASSETS.BOAT);

        scene.add.existing(this);
        this.setDisplaySize(188, 188);
        this.setOrigin(0, 0.5);
        this.y = horizonY;

        this.startWaveAnimation();
    }

    private startWaveAnimation() {
        const startDelay = Math.random() * 2000;
        const duration = 2500 + Math.random() * 1000;

        this.rotation = 0;

        this.scene.tweens.add({
            targets: this,
            rotation: { from: Phaser.Math.DegToRad(-2.5), to: Phaser.Math.DegToRad(2.5) },
            duration: duration,
            delay: startDelay,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
}