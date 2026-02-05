import Phaser from "phaser";
import { CONSTANTS } from "../constants";
import { Plane } from "../objects/Plane";
import { Boat } from "../objects/Boat";
import { GameObject } from "../objects/GameObject";
import { RouteGenerator } from "../RouteGenerator";
import type { GameParams, GeneratedRoute } from "../RouteTypes";

export class MainScene extends Phaser.Scene {
  private plane!: Plane;
  private sky!: Phaser.GameObjects.TileSprite;
  private clouds!: Phaser.GameObjects.Group;
  private nextCloudAt: number = 0;
  private ships!: Phaser.GameObjects.Group;
  private objects!: Phaser.Physics.Arcade.Group;
  private decks!: Phaser.Physics.Arcade.StaticGroup;
  private boatBodies!: Phaser.Physics.Arcade.StaticGroup;
  private decoys!: Phaser.GameObjects.Group;
  private currentWinText?: Phaser.GameObjects.Text;
  private distance: number = 0;
  private multiplier: number = CONSTANTS.INITIAL_MULTIPLIER;
  private isGameOver: boolean = false;
  private isRunning: boolean = false;
  private runSpeedX: number = CONSTANTS.PLANE.HORIZONTAL_SPEED;
  private boatCollider?: Phaser.Physics.Arcade.Collider;
  private deckCollider?: Phaser.Physics.Arcade.Collider;

  private gameParams: GameParams | null = null;
  private currentRoute: GeneratedRoute | null = null;
  private isDeterministic: boolean = false;
  private routeSpawnIndex: number = 0;
  private collectedIndices: Set<number> = new Set();
  private routeObjectsList: Array<{ obj: GameObject; index: number }> = [];
  private spawnedIndices: Set<number> = new Set();
  private missedIndices: Set<number> = new Set();
  private winBoatSpawned: boolean = false;
  private routeBoatSpawnIndex: number = 0;
  private decoySpawnIndex: number = 0;

  private engineSound?: Phaser.Sound.BaseSound;
  private prevPlaneY?: number;
  private prevPlaneX?: number;

  constructor() {
    super("MainScene");
  }

  preload() {
    this.load.image(CONSTANTS.ASSETS.SKY, "plane-game/sky.png");
    this.load.svg(CONSTANTS.ASSETS.PLANE, "plane-game/plane.svg", { width: 512, height: 512 });
    this.load.image(CONSTANTS.ASSETS.ROCKET, "plane-game/rocket.png");
    this.load.image(CONSTANTS.ASSETS.BOAT, "plane-game/boat.png");
    this.load.image(CONSTANTS.ASSETS.ROCKET, "plane-game/rocket.png");
    this.load.image(CONSTANTS.ASSETS.BOAT, "plane-game/boat.png");
    this.load.image("cloud1", "plane-game/cloud1.png");
    this.load.image("cloud2", "plane-game/cloud2.png");
    this.load.image("cloud3", "plane-game/cloud3.png");
    this.load.image("cloud4", "plane-game/cloud4.png");
    this.load.image("cloud5", "plane-game/cloud5.png");
    this.load.image("cloud6", "plane-game/cloud6.png");
    this.load.image("text-effect", "plane-game/text-effect.png");
    this.load.image("explode-effect1", "plane-game/explode-effect1.png");
    this.load.image("explode-effect2", "plane-game/explode-effect2.png");
    this.load.image("explode-effect3", "plane-game/explode-effect3.png");
    this.load.image("explode-effect4", "plane-game/explode-effect4.png");
    this.load.image("explode-effect5", "plane-game/explode-effect5.png");

    this.load.audio("engine_loop", "plane-game/sounds/engine_loop.ogg");
    this.load.audio("crash_water", "plane-game/sounds/crash_water.ogg");
    this.load.audio("explosion", "plane-game/sounds/explosion.ogg");
    this.load.audio("win_low", "plane-game/sounds/win_low.ogg");
    this.load.audio("win_medium", "plane-game/sounds/win_medium.ogg");
    this.load.audio("win_high", "plane-game/sounds/win_high.ogg");

    this.load.audio("collect_1", "plane-game/sounds/collect_1.ogg");
    this.load.audio("collect_2", "plane-game/sounds/collect_2.ogg");
    this.load.audio("collect_3", "plane-game/sounds/collect_3.ogg");
    this.load.audio("collect_4", "plane-game/sounds/collect_4.ogg");

    this.load.audio("collect_mult_1", "plane-game/sounds/collect_mult_1.ogg");
    this.load.audio("collect_mult_2", "plane-game/sounds/collect_mult_2.ogg");
    this.load.audio("collect_mult_3", "plane-game/sounds/collect_mult_3.ogg");
    this.load.audio("collect_mult_4", "plane-game/sounds/collect_mult_4.ogg");
  }



  private playCollectSound(isMultiplier: boolean) {
    if (isMultiplier) {
      const idx = Phaser.Math.Between(1, 4);
      this.sound.play(`collect_mult_${idx}`, { volume: 0.5 });
    } else {
      const idx = Phaser.Math.Between(1, 4);
      this.sound.play(`collect_${idx}`, { volume: 0.5 });
    }
  }

  create() {
    this.isGameOver = false;
    this.isRunning = false;
    this.distance = 0;
    this.multiplier = CONSTANTS.INITIAL_MULTIPLIER;
    this.nextCloudAt = 0;
    this.currentRoute = null;
    this.routeSpawnIndex = 0;
    this.collectedIndices.clear();
    this.routeObjectsList = [];
    this.spawnedIndices.clear();
    this.missedIndices.clear();
    this.winBoatSpawned = false;
    this.prevPlaneY = undefined;
    this.prevPlaneX = undefined;

    if (!this.anims.exists("explode_anim")) {
      this.anims.create({
        key: "explode_anim",
        frames: [
          { key: "explode-effect1" },
          { key: "explode-effect2" },
          { key: "explode-effect3" },
          { key: "explode-effect4" },
          { key: "explode-effect5" }
        ],
        frameRate: 5,
        hideOnComplete: true,
      });
    }

    this.physics.world.setBounds(0, -10000, CONSTANTS.WORLD_WIDTH, 10000 + CONSTANTS.HEIGHT);
    (this.physics.world as any).overlapBias = 32;
    (this.physics.world as any).tileBias = 32;

    const skyTexture = this.textures.get(CONSTANTS.ASSETS.SKY);
    const skyOriginalHeight = skyTexture.getSourceImage().height;
    const scale = CONSTANTS.HORIZON_Y / skyOriginalHeight;

    this.sky = this.add
      .tileSprite(0, 0, CONSTANTS.WIDTH * 2, CONSTANTS.HEIGHT, CONSTANTS.ASSETS.SKY)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setTileScale(scale, scale)
      .setDepth(0);

    this.clouds = this.add.group();
    this.add
      .rectangle(0, CONSTANTS.HORIZON_Y, CONSTANTS.WIDTH, 5000, 0x000000)
      .setOrigin(0, 0)
      .setScrollFactor(0, 1)
      .setDepth(40);

    this.ships = this.add.group();
    this.objects = this.physics.add.group();
    this.decoys = this.add.group();
    this.decks = this.physics.add.staticGroup();
    this.boatBodies = this.physics.add.staticGroup();

    const startBoat = new Boat(this, 0);
    startBoat.setDepth(60);
    this.ships.add(startBoat);
    this.addBoatColliders(startBoat);

    const deckY = CONSTANTS.HORIZON_Y + CONSTANTS.BOAT.Y_OFFSET + CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;
    this.plane = new Plane(this, 100, deckY - CONSTANTS.PLANE.HEIGHT / 2);
    this.plane.setDepth(30);
    this.plane.syncTrailDepth();

    if (!this.textures.exists("soft-glow")) {
      const glowCanvas = this.textures.createCanvas("soft-glow", 64, 64);
      if (glowCanvas) {
        const ctx = glowCanvas.context;
        const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, "rgba(0, 136, 255, 0.5)");
        grd.addColorStop(0.5, "rgba(0, 136, 255, 0.1)");
        grd.addColorStop(1, "rgba(0, 136, 255, 0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 64, 64);
        glowCanvas.refresh();
      }
    }

    this.cameras.main.setBounds(0, -10000, CONSTANTS.WORLD_WIDTH, 10000 + CONSTANTS.HEIGHT);
    // Follow plane vertically (lerpY=0.1)
    // offsetY = -150 shifts plane UP into the upper half of screen (approx 30% from top)
    this.cameras.main.startFollow(this.plane, true, 1, 0.1, -100, -150);

    this.physics.add.overlap(
      this.plane,
      this.objects,
      this.handleObjectOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.boatCollider = this.physics.add.overlap(
      this.plane,
      this.boatBodies,
      this.handleBoatBodyCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.deckCollider = this.physics.add.overlap(
      this.plane,
      this.decks,
      this.handleDeckCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    if (this.boatCollider) this.boatCollider.active = false;

    this.currentWinText = this.add.text(0, 0, "", {
      fontSize: "16px",
      fontFamily: "Rubik, sans-serif",
      fontStyle: "bold",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    })
      .setOrigin(0.5, -1)
      .setScrollFactor(0)
      .setDepth(130)
      .setAlpha(0);

    this.game.events.emit("ready");
  }

  public getPlane() {
    return this.plane;
  }

  update() {
    if (this.isGameOver) return;

    if (this.sky && this.isRunning && this.plane.state === "FLIGHT") {
      const skyTexture = this.textures.get(CONSTANTS.ASSETS.SKY);
      const skyOriginalWidth = skyTexture.getSourceImage().width;
      const skyOriginalHeight = skyTexture.getSourceImage().height;
      const scale = CONSTANTS.HORIZON_Y / skyOriginalHeight;
      const scaledWidth = skyOriginalWidth * scale;

      const scrollSpeed = this.runSpeedX * 0.3;
      // Use timeScale to speed up manual scrolling
      const deltaTime = (this.game.loop.delta / 1000) * this.time.timeScale;
      this.sky.tilePositionX = (this.sky.tilePositionX + scrollSpeed * deltaTime) % scaledWidth;

      this.spawnAndUpdateClouds(scrollSpeed, deltaTime);
    }

    this.plane.update();
    this.sweepLandingCheck();

    if (this.plane.state === "FLIGHT" && this.isRunning) {
      this.distance = Math.floor(this.plane.x / 10);
      this.updateCameraYClamp();

      if (this.currentWinText) {
      if (this.gameParams && this.gameParams.betAmount > 0 && this.multiplier > 0) {
        const rawWin = this.gameParams.betAmount * this.multiplier;
        let winAmount: number;
        if (rawWin < 1) {
            winAmount = Math.floor(rawWin * 10) / 10;
            if (rawWin > 0 && winAmount === 0) winAmount = 0.1;
        } else {
            winAmount = Number(rawWin.toFixed(2));
        }
        this.currentWinText.setText(`${winAmount} TON`);
        this.currentWinText.setAlpha(1);

        const cam = this.cameras.main;
        const px = Math.round(this.plane.x - cam.scrollX);
        const py = Math.round(this.plane.y - cam.scrollY - 80);
        this.currentWinText.setPosition(px, py);
      } else {
        this.currentWinText.setAlpha(0);
      }
      }

      if (this.isDeterministic && this.currentRoute) {
        this.spawnRouteObjectsAhead();
        this.spawnDecoyObjectsAhead();
        this.spawnRouteBoatsAhead();
        this.handleWinBoatSpawn();
        this.sweepCollectSteps();
        this.checkMissedSteps();
    }

      if (this.deckCollider) this.deckCollider.active = true;

      this.objects.getChildren().forEach((child) => {
        const obj = child as GameObject;
        if (obj.x < this.cameras.main.scrollX - 150 && obj.active) {
          obj.destroy();
        }
      });

      this.decoys.getChildren().forEach((child) => {
      const obj = child as GameObject;
      if (obj.x < this.cameras.main.scrollX - 250 && obj.active) {
        obj.destroy();
      }
    });

    // Cleanup Ships (Heavy objects)
    this.ships.getChildren().forEach((child) => {
      const ship = child as Boat;
      if (ship.x < this.cameras.main.scrollX - 600 && ship.active) {
        ship.destroy();
      }
    });

      this.checkDeathBelowScreen();

      this.events.emit("updateHUD", {
        distance: this.distance,
        multiplier: this.multiplier,
      });
    }

    if (this.plane.state === "LANDED") {
      if (this.plane.currentDeck) {
        this.plane.body.velocity.x *= 0.9;

        const deck = this.plane.currentDeck as any;
        if (deck.parentBoat) {
          const boat = deck.parentBoat as Boat;
          this.plane.rotation = boat.rotation;

          const dx = this.plane.x - boat.x;
          const dy = dx * Math.sin(boat.rotation);

          const baseY = deck.y - this.plane.displayHeight / 2;
          this.plane.y = baseY + dy;
        }

        if (Math.abs(this.plane.body.velocity.x) < 5) {
          this.gameOver(true);
        }
        if (!this.plane.isSupportedByDeck()) {
          this.plane.body.setAllowGravity(true);
          this.plane.state = "FLIGHT";
        }
      } else {
        this.plane.state = "FLIGHT";
        this.plane.body.setAllowGravity(true);
      }
    }

    this.updateFloatingText();

    this.prevPlaneY = this.plane.y;
    this.prevPlaneX = this.plane.x;
  }

  private sweepCollectSteps() {
    if (!this.isDeterministic || !this.currentRoute) return;
    if (this.prevPlaneX === undefined || this.prevPlaneY === undefined) return;
    if (this.plane.state !== "FLIGHT") return;

    const prevX = this.prevPlaneX;
    const prevY = this.prevPlaneY;
    const currX = this.plane.x;
    const currY = this.plane.y;
    if (currX <= prevX) return;

    const planeHalfW = this.plane.body.width / 2;
    const planeHalfH = this.plane.body.height / 2;
    const sweepLeft = Math.min(prevX - planeHalfW, currX - planeHalfW);
    const sweepRight = Math.max(prevX + planeHalfW, currX + planeHalfW);
    const sweepTop = Math.min(prevY - planeHalfH, currY - planeHalfH);
    const sweepBottom = Math.max(prevY + planeHalfH, currY + planeHalfH);

    for (let i = 0; i < this.currentRoute.steps.length; i++) {
      if (!this.spawnedIndices.has(i)) continue;
      if (this.collectedIndices.has(i)) continue;
      if (this.missedIndices.has(i)) continue;

      const item = this.routeObjectsList.find((r) => r.index === i);
      const obj = item?.obj;
      if (!obj || !obj.active) continue;

      const objBody = obj.body as Phaser.Physics.Arcade.Body | undefined;
      if (!objBody) continue;

      const objHalfW = objBody.width / 2;
      const objHalfH = objBody.height / 2;
      const objLeft = obj.x - objHalfW;
      const objRight = obj.x + objHalfW;
      const objTop = obj.y - objHalfH;
      const objBottom = obj.y + objHalfH;

      if (sweepRight < objLeft) continue;
      if (sweepLeft > objRight) continue;
      if (sweepBottom < objTop) continue;
      if (sweepTop > objBottom) continue;

      this.handleObjectOverlap(this.plane as any, obj as any);
    }
  }

  private handleObjectOverlap(
    _plane: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    objBody: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const obj = objBody as unknown as GameObject;
    if (obj.getData("collected")) return;

    obj.setData("collected", true);
    const body = obj.body as Phaser.Physics.Arcade.Body | undefined;
    if (body) body.enable = false;

    const routeItem = this.routeObjectsList.find(r => r.obj === obj);

    if (this.isDeterministic && this.currentRoute && routeItem) {
      const step = this.currentRoute.steps[routeItem.index];
      if (!step) return;

      if (this.collectedIndices.has(routeItem.index)) return;
      this.collectedIndices.add(routeItem.index);

      if (step.type === "ADDITIVE") {
        this.multiplier += step.value;
        this.spawnFloatingText(`+${step.value}`, "#28c76f");
        this.applyBonusImpulse(step.value);
        this.playCollectSound(false);
      } else if (step.type === "MULTIPLIER") {
        this.multiplier *= step.value;
        this.spawnFloatingText(`x${step.value}`, "#28c76f");
        this.plane.body.velocity.y = CONSTANTS.PLANE.BONUS_IMPULSE.X2;
        this.playCollectSound(true);
        this.playCollectSound(true);
      } else if (step.type === "TORPEDO") {
        this.multiplier = Math.max(0.01, Math.round((this.multiplier / 2) * 100) / 100);
        this.spawnFloatingText("/2", "#ff4d4f");
        this.plane.body.velocity.y = CONSTANTS.PLANE.BONUS_IMPULSE.ROCKET;
        this.sound.play("explosion");
      }

    } else {
      const rawValue = obj.value;
      if (obj.objectType === CONSTANTS.OBJECTS.TYPES.BONUS) {
        if (typeof rawValue === "string" && rawValue.startsWith("x")) {
          this.multiplier *= Number.parseInt(rawValue.substring(1), 10);
          this.spawnFloatingText(rawValue, "#28c76f");
        } else {
          this.multiplier += Number(rawValue);
          this.spawnFloatingText(`+${rawValue}`, "#28c76f");
        }
        this.applyBonusImpulse(typeof rawValue === "number" ? rawValue : 2);
        this.playCollectSound(typeof rawValue === "string" && rawValue.startsWith("x"));
      } else {
        this.multiplier = Math.max(0.01, Math.round((this.multiplier / 2) * 100) / 100);
        this.spawnFloatingText("/2", "#ff4d4f");
        this.plane.body.velocity.y = CONSTANTS.PLANE.BONUS_IMPULSE.ROCKET;
        this.sound.play("explosion");
      }
    }

    this.multiplier = Math.min(this.multiplier, CONSTANTS.SCORE.MAX_MULTIPLIER);

    if (obj.objectType === CONSTANTS.OBJECTS.TYPES.ROCKET && obj.active) {
      obj.explode();
    } else if (obj.active) {
      obj.destroy();
    }
  }

  private applyBonusImpulse(value: number) {
    let impulse: number;
    if (value <= 1) impulse = CONSTANTS.PLANE.BONUS_IMPULSE.V1;
    else if (value <= 2) impulse = CONSTANTS.PLANE.BONUS_IMPULSE.V2;
    else if (value <= 3) impulse = CONSTANTS.PLANE.BONUS_IMPULSE.V5;
    else impulse = CONSTANTS.PLANE.BONUS_IMPULSE.V10;

    this.plane.body.velocity.y = impulse;
  }

  private handleWinBoatSpawn() {
    if (!this.currentRoute) return;
    if (this.winBoatSpawned) return;

    const allCollected = this.collectedIndices.size >= this.currentRoute.steps.length;

    if (allCollected && this.currentRoute.outcome === "WIN") {
      if (this.gameParams?.targetModifier) {
        this.multiplier = this.gameParams.targetModifier;
      }

      this.winBoatSpawned = true;
    }
  }

  private canLandOnDeck(): boolean {
    if (!this.isDeterministic || !this.currentRoute) return true;
    if (this.currentRoute.outcome === "SINK") return false;
    return this.winBoatSpawned || this.collectedIndices.size >= this.currentRoute.steps.length;
  }

  private checkMissedSteps() {
    if (!this.isDeterministic || !this.currentRoute) return;
    const marginX = 140;
    const planeX = this.plane.x;
    for (let i = 0; i < this.currentRoute.steps.length; i++) {
      if (!this.spawnedIndices.has(i)) continue;
      if (this.collectedIndices.has(i)) continue;
      if (this.missedIndices.has(i)) continue;
      const step = this.currentRoute.steps[i];
      if (planeX <= step.xPosition + marginX) continue;
      this.missedIndices.add(i);
      console.warn(
        `[MainScene] MISS Step${i} @ x=${Math.round(step.xPosition)} y=${Math.round(step.yPosition)} plane.x=${Math.round(planeX)} plane.y=${Math.round(this.plane.y)} vy=${Math.round(this.plane.body.velocity.y)}`,
      );
    }
  }

  private spawnAndUpdateClouds(scrollSpeed: number, deltaTime: number) {
    if (this.time.now >= this.nextCloudAt) {
      const zoom = this.cameras.main.zoom || 1;
      const visibleWidth = this.cameras.main.width / zoom;
      const viewRightEdge = (CONSTANTS.WIDTH / 2) + (visibleWidth / 2);

      const spawnX = viewRightEdge + 100;
      const cloudTexture = `cloud${Phaser.Math.Between(1, 6)}`;
      const cloud = this.add.image(spawnX, Phaser.Math.Between(30, CONSTANTS.HORIZON_Y - 140), cloudTexture);

      cloud.setOrigin(0.5).setAlpha(Phaser.Math.FloatBetween(0.2, 0.6)).setScrollFactor(0).setDepth(1);
      cloud.setDisplaySize(100, (cloud.height / cloud.width) * 100);
      cloud.setData("speedMul", Phaser.Math.FloatBetween(0.35, 0.6));
      this.clouds.add(cloud);
      this.nextCloudAt = this.time.now + Phaser.Math.Between(1600, 4200);
    }

    this.clouds.getChildren().forEach((child) => {
      const cloud = child as Phaser.GameObjects.Image;
      cloud.x -= scrollSpeed * deltaTime * ((cloud.getData("speedMul") as number) ?? 1);

      if (cloud.x < -140) cloud.destroy();
    });
  }

  public setStake(_amount: number) {
  }

  public setGameParams(params: GameParams) {
    this.gameParams = params;
    this.isDeterministic = true;
  }

  public startRun(speedMultiplier: number = 1) {
    if (this.isGameOver || this.isRunning) return;

    this.isRunning = true;

    // Use constant base speed. Speedup is handled by timeScale.
    this.runSpeedX = CONSTANTS.PLANE.HORIZONTAL_SPEED;
    // this.plane.setSpeedMultiplier(speedMultiplier); // helper removed

    this.multiplier = CONSTANTS.INITIAL_MULTIPLIER;
    this.routeSpawnIndex = 0;
    this.collectedIndices.clear();
    this.routeObjectsList = [];
    this.spawnedIndices.clear();
    this.missedIndices.clear();

    if (this.gameParams && this.isDeterministic) {
      const generator = new RouteGenerator(this.gameParams);
      this.currentRoute = generator.generate();
      this.routeBoatSpawnIndex = 0;
      this.winBoatSpawned = false;
      this.decoySpawnIndex = 0;
    } else {
      this.currentRoute = null;
    }

    const deckY = CONSTANTS.HORIZON_Y + CONSTANTS.BOAT.Y_OFFSET + CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;
    this.plane.setAlpha(1);
    this.plane.body.setEnable(true);
    this.plane.body.setAllowGravity(true);
    this.plane.state = "FLIGHT";
    this.plane.body.setVelocityX(this.runSpeedX);
    this.plane.jump(CONSTANTS.PLANE.TAKEOFF_IMPULSE);
    this.plane.y = deckY - this.plane.displayHeight / 2;
    this.plane.x = 100;

    console.log(`[PlaneGame] startRun speedMultiplier: ${speedMultiplier}`);
    // Invert physics timescale if user reports 3.0 is slow.
    // Some Phaser configs treat timeScale as "duration of step" vs "multiplier".
    // If 3.0 was slow, we try 1/3.
    this.physics.world.timeScale = speedMultiplier > 1 ? (1 / speedMultiplier) : 1;
    console.log(`[PlaneGame] Physics TimeScale set to: ${this.physics.world.timeScale}`);
    this.time.timeScale = speedMultiplier;
    this.tweens.timeScale = speedMultiplier;

    if (!this.engineSound) {
      this.engineSound = this.sound.add("engine_loop", { loop: true, volume: 0.3 });
    }
    this.engineSound.play();
    if (this.engineSound instanceof Phaser.Sound.WebAudioSound) {
      this.engineSound.setRate(speedMultiplier);
    }

    this.time.delayedCall(250, () => {
      if (!this.isGameOver && this.boatCollider) this.boatCollider.active = true;
    });
  }

  private spawnRouteObjectsAhead() {
    if (!this.currentRoute) return;

    const spawnAhead = 600;

    while (this.routeSpawnIndex < this.currentRoute.steps.length) {
      const step = this.currentRoute.steps[this.routeSpawnIndex];
      if (step.xPosition > this.plane.x + spawnAhead) break;

      const type = step.elementType === "BONUS" ? CONSTANTS.OBJECTS.TYPES.BONUS : CONSTANTS.OBJECTS.TYPES.ROCKET;
      const obj = new GameObject(this, step.xPosition, step.yPosition, type, step.elementValue);
      obj.setDepth(35);
      this.objects.add(obj);

      this.routeObjectsList.push({ obj, index: this.routeSpawnIndex });
      this.spawnedIndices.add(this.routeSpawnIndex);

      this.routeSpawnIndex++;
    }
  }

  public stopRun() {
    this.isRunning = false;
    this.physics.world.timeScale = 1;
    this.time.timeScale = 1;
    this.tweens.timeScale = 1;
    this.engineSound?.stop();
  }

  private spawnDecoyObjectsAhead() {
    if (!this.currentRoute) return;

    const spawnAhead = 1200;

    while (this.decoySpawnIndex < this.currentRoute.decoyObjects.length) {
      const decoy = this.currentRoute.decoyObjects[this.decoySpawnIndex];
      if (decoy.xPosition > this.plane.x + spawnAhead) break;

      const type = decoy.type === "BONUS" ? CONSTANTS.OBJECTS.TYPES.BONUS : CONSTANTS.OBJECTS.TYPES.ROCKET;
      const obj = new GameObject(this, decoy.xPosition, decoy.yPosition, type, decoy.value);
      obj.setDepth(25);
      if (obj.body) obj.body.enable = false;

      this.decoys.add(obj);
      this.decoySpawnIndex++;
    }
  }

  private spawnRouteBoatsAhead() {
    if (!this.currentRoute) return;

    const spawnAhead = CONSTANTS.WIDTH + 600;

    while (this.routeBoatSpawnIndex < this.currentRoute.boatPositions.length) {
      const boatX = this.currentRoute.boatPositions[this.routeBoatSpawnIndex];
      if (boatX > this.plane.x + spawnAhead) break;

      const newShip = new Boat(this, boatX);
      newShip.setDepth(60);
      this.ships.add(newShip);
      this.addBoatColliders(newShip);

      this.routeBoatSpawnIndex++;
    }
  }



  private checkDeathBelowScreen() {
    if (this.plane.y - this.plane.displayHeight / 2 <= this.cameras.main.worldView.bottom) return;
    this.gameOver(false);
  }

  private updateCameraYClamp() {
    const cam = this.cameras.main;
    const topEdge = cam.scrollY + 90;
    const bottomEdge = cam.scrollY + CONSTANTS.HEIGHT - 160;
    let targetScrollY: number;
    if (this.plane.y < topEdge) targetScrollY = this.plane.y - 90;
    else if (this.plane.y > bottomEdge) targetScrollY = this.plane.y - (CONSTANTS.HEIGHT - 160);
    else return;
    cam.scrollY = Phaser.Math.Linear(cam.scrollY, targetScrollY, 0.18);
  }

  private spawnFloatingText(text: string, color: string) {
    const cam = this.cameras.main;
    const startX = Math.round(this.plane.x - cam.scrollX);
    const startY = Math.round(this.plane.y - cam.scrollY - 50);

    const txt = this.add.text(startX, startY, text, {
      fontSize: "28px",
      fontFamily: "Rubik, sans-serif",
      fontStyle: "bold",
      color,
      stroke: "#000000",
      strokeThickness: 3,
    })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(200)
      .setAlpha(0)
      .setScale(0.5);

    this.tweens.add({
      targets: txt,
      y: startY - 60,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.2 },
      duration: 1000,
      ease: "Power1",
      onComplete: () => {
        txt.destroy();
      },
    });
  }

  private updateFloatingText() {
  }

  private addBoatColliders(boat: Boat) {
    const deckY = boat.y + CONSTANTS.BOAT.DECK_Y_OFFSET_FROM_HORIZON;
    const deck = this.add.zone(boat.x + CONSTANTS.BOAT.WIDTH / 2, deckY, CONSTANTS.BOAT.WIDTH, 34);
    this.physics.add.existing(deck, true);
    (deck as any).parentBoat = boat;
    this.decks.add(deck as unknown as Phaser.Physics.Arcade.Sprite);

    const boatBottomY = boat.y + CONSTANTS.BOAT.HEIGHT / 2;

    const dxPerFrame = Math.ceil(Math.abs(this.runSpeedX) / 60);
    const sideW = Math.max(50, dxPerFrame + 24);
    const sideHalf = sideW / 2;

    const hullTopY = deckY + 8;
    const hullCenterY = (hullTopY + boatBottomY) / 2;
    const hullH = Math.max(20, boatBottomY - hullTopY);

    [
      this.add.zone(boat.x + sideHalf, hullCenterY, sideW, hullH),
      this.add.zone(boat.x + CONSTANTS.BOAT.WIDTH - sideHalf, hullCenterY, sideW, hullH),
      this.add.zone(boat.x + CONSTANTS.BOAT.WIDTH / 2, boatBottomY - 30, CONSTANTS.BOAT.WIDTH, 60)
    ].forEach((z) => {
      this.physics.add.existing(z, true);
      this.boatBodies.add(z as unknown as Phaser.Physics.Arcade.Sprite);
    });
  }

  private handleDeckCollision(
    planeObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    deckObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    if (this.isGameOver) return;
    const plane = planeObj as unknown as Plane & { currentDeck?: Phaser.GameObjects.Zone };

    if (plane.x < 400) return;
    if (plane.state === "LANDED" || plane.body.velocity.y < 0) return;

    const deck = deckObj as Phaser.GameObjects.Zone;
    if (plane.x < deck.x - deck.width / 2 + 18 || plane.x > deck.x + deck.width / 2 - 18) return;
    if (!this.canLandOnDeck()) return;

    plane.x = deck.x;
    plane.y = deck.y - plane.displayHeight / 2;
    plane.body.setVelocityY(0);
    plane.body.setAllowGravity(false);
    plane.state = "LANDED";
    plane.currentDeck = deck;
  }

  private handleBoatBodyCollision(
    planeObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    _boatBodyObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    if (this.isGameOver) return;
    const plane = planeObj as unknown as Plane;
    if (plane.state === "LANDED") return;
    if (this.isDeterministic && this.currentRoute?.outcome === "SINK") return;

    if (this.currentWinText) this.currentWinText.setAlpha(0);
    this.gameOver(false);
  }

  private sweepLandingCheck() {
    if (this.isGameOver) return;
    if (!this.isRunning) return;
    if (this.plane.state !== "FLIGHT") return;
    if (this.plane.x < 400) return;
    if (this.plane.body.velocity.y < 0) return;
    if (this.prevPlaneY === undefined) return;

    const prevBottom = this.prevPlaneY + this.plane.displayHeight / 2;
    const currBottom = this.plane.y + this.plane.displayHeight / 2;
    if (currBottom <= prevBottom) return;

    const children = this.decks.getChildren();
    for (let i = 0; i < children.length; i++) {
      const deck = children[i] as unknown as Phaser.GameObjects.Zone;
      const surfaceY = deck.y;

      if (prevBottom <= surfaceY && currBottom >= surfaceY) {
        const left = deck.x - deck.width / 2 + 18;
        const right = deck.x + deck.width / 2 - 18;
        if (this.plane.x < left || this.plane.x > right) continue;

        if (!this.canLandOnDeck()) return;

        this.plane.x = deck.x;
        this.plane.y = surfaceY - this.plane.displayHeight / 2;
        this.plane.body.setVelocityY(0);
        this.plane.body.setAllowGravity(false);
        this.plane.state = "LANDED";
        this.plane.currentDeck = deck;
        return;
      }
    }
  }

  private gameOver(isWin: boolean) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.isRunning = false;
    this.cameras.main.stopFollow();
    this.plane.body.setVelocity(0, 0);
    this.plane.body.setAcceleration(0, 0);
    this.plane.body.setAllowGravity(false);

    this.events.emit("gameOver", { distance: this.distance, multiplier: this.multiplier, isWin });

    this.engineSound?.stop();

    if (this.gameParams?.speedMode === "FAST") {
        this.physics.world.timeScale = 1;
        this.time.timeScale = 1;
        this.tweens.timeScale = 1;
    }

    if (isWin) {
      if (this.multiplier < 2) this.sound.play("win_low");
      else if (this.multiplier < 5) this.sound.play("win_medium");
      else this.sound.play("win_high");
    } else {
      this.sound.play("crash_water");
    }
  }
}