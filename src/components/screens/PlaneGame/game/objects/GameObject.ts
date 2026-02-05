import Phaser from "phaser";
import { CONSTANTS } from "../constants";
import { BONUS_HITBOX, ROCKET_HITBOX, ROCKET_DISPLAY_SIZE } from "../hitboxes";

export class GameObject extends Phaser.Physics.Arcade.Sprite {
  public value: number | string;
  public objectType: string;
  private feedbackText?: Phaser.GameObjects.Text;
  private feedbackTextPrefix?: Phaser.GameObjects.Text;
  backgroundSprite?: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: string,
    value: number | string = 0,
  ) {
    const texture =
      type === CONSTANTS.OBJECTS.TYPES.ROCKET ? CONSTANTS.ASSETS.ROCKET : "";
    super(scene, x, y, texture);

    this.objectType = type;
    this.value = value;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);

    if (type === CONSTANTS.OBJECTS.TYPES.ROCKET) {
      this.setDisplaySize(ROCKET_DISPLAY_SIZE.width, ROCKET_DISPLAY_SIZE.height);
      body.setSize(ROCKET_HITBOX.width, ROCKET_HITBOX.height);
      body.setOffset(
        this.displayWidth / 2 - ROCKET_HITBOX.width / 2,
        this.displayHeight / 2 - ROCKET_HITBOX.height / 2,
      );
    } else {
      this.setVisible(false);

      let scaleData = { initial: 1 };
      const strValue = value.toString();
      const isMultiplier = value === 10 || strValue.startsWith("x");

      if (isMultiplier) {
        const bg = scene.add
          .image(this.x, this.y, "text-effect")
          .setOrigin(0.5);

        const targetSize = 104;
        scaleData.initial = targetSize / Math.max(bg.width, bg.height);
        bg.setScale(scaleData.initial);

        this.backgroundSprite = bg;

        // Segregate "x" and number
        let valNum = strValue;
        let prefix = "";
        if (strValue.startsWith("x")) {
          prefix = "x";
          valNum = strValue.substring(1);
        }

        if (prefix) {
          this.feedbackTextPrefix = scene.add.text(this.x, this.y + 2, "x", {
            fontSize: "20px",
            color: "#ffffff",
            fontFamily: "Rubik, sans-serif",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 2,
          }).setOrigin(1, 0.5);
        }

        this.feedbackText = scene.add.text(this.x, this.y, valNum, {
          fontSize: "32px",
          color: "#ffffff",
          fontFamily: "Rubik, sans-serif",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        }).setOrigin(prefix ? 0 : 0.5, 0.5);

        // Add scale Pulse animation ONLY to X
        if (this.feedbackTextPrefix) {
          scene.tweens.add({
            targets: this.feedbackTextPrefix,
            scale: { from: 1, to: 1.2 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
        }

      } else {
        const bg = scene.add
          .image(this.x, this.y, "soft-glow")
          .setOrigin(0.5)
          .setAlpha(0.6);

        const targetSize = 45;
        scaleData.initial = targetSize / Math.max(bg.width, bg.height);
        bg.setScale(scaleData.initial);

        this.backgroundSprite = bg;

        this.feedbackText = scene.add
          .text(this.x, this.y, value.toString(), {
            fontSize: "24px",
            color: "#ffffff",
            fontFamily: "Rubik, sans-serif",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 3,
          })
          .setOrigin(0.5);
      }

      if (this.backgroundSprite) {
        scene.tweens.add({
          targets: this.backgroundSprite,
          scale: { from: scaleData.initial * 0.9, to: scaleData.initial * 1.1 },
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
      }

      if (this.feedbackText) this.feedbackText.setShadow(2, 2, "#000000", 0, false, true);
      if (this.feedbackTextPrefix) this.feedbackTextPrefix.setShadow(2, 2, "#000000", 0, false, true);

      body.setSize(BONUS_HITBOX.width, BONUS_HITBOX.height, true);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.feedbackText) {
      this.feedbackText.x = this.x;
      this.feedbackText.y = this.y;
    }
    if (this.feedbackTextPrefix) {
      this.feedbackTextPrefix.x = this.x;
      this.feedbackTextPrefix.y = this.y + 2;
    }
    if (this.backgroundSprite) {
      this.backgroundSprite.x = this.x;
      this.backgroundSprite.y = this.y;
    }
  }

  explode() {
    if (this.objectType === CONSTANTS.OBJECTS.TYPES.ROCKET) {
      const boom = this.scene.add
        .sprite(this.x, this.y, "explode-effect1")
        .setOrigin(0.5)
        .setDepth(200);

      const targetSize = 130;
      const scale = targetSize / Math.max(boom.width, boom.height);
      boom.setScale(scale);

      if (boom.anims) {
        boom.anims.timeScale = 1.5;
      }
      boom.play("explode_anim");
      boom.once("animationcomplete", () => {
        boom.destroy();
      });
    }

    super.destroy();
  }

  destroy(fromScene?: boolean) {
    if (this.feedbackText) this.feedbackText.destroy();
    if (this.feedbackTextPrefix) this.feedbackTextPrefix.destroy();
    if (this.backgroundSprite) this.backgroundSprite.destroy();
    super.destroy(fromScene);
  }
}