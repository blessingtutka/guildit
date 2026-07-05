import Phaser from 'phaser';

export interface CardData {
  action: string;
  label: string;
  iconKey: string;
  colorHex: number;
  ownerName: string;
  points: number;
}

const CARD_WIDTH = 120;
const CARD_HEIGHT = 168;

export class Card extends Phaser.GameObjects.Container {
  private readonly frontFace: Phaser.GameObjects.Container;
  private readonly backFace: Phaser.GameObjects.Container;
  private isRevealed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, data: CardData) {
    super(scene, x, y);

    this.frontFace = this.buildFrontFace(scene, data);
    this.backFace = this.buildBackFace(scene, data);
    this.backFace.setVisible(false);

    this.add([this.frontFace, this.backFace]);
    this.setSize(CARD_WIDTH, CARD_HEIGHT);
    scene.add.existing(this);

    // Start invisible/small — playIn() animates it onto the field
    this.setAlpha(0);
    this.setScale(0.5);
  }

  //  Front face
  private buildFrontFace(
    scene: Phaser.Scene,
    data: CardData
  ): Phaser.GameObjects.Container {
    const bg = scene.add.graphics();
    bg.fillStyle(0x161921, 1);
    bg.fillRoundedRect(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT,
      10
    );
    bg.lineStyle(3, data.colorHex, 1);
    bg.strokeRoundedRect(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT,
      10
    );

    const logo = scene.add.image(0, -8, 'card-logo').setDisplaySize(56, 56);

    const label = scene.add
      .text(0, 42, data.label, {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        color: '#8891aa',
        fontStyle: '600',
      })
      .setOrigin(0.5);

    return scene.add.container(0, 0, [bg, logo, label]);
  }

  //  Back face (revealed state)
  private buildBackFace(
    scene: Phaser.Scene,
    data: CardData
  ): Phaser.GameObjects.Container {
    const bg = scene.add.graphics();
    bg.fillStyle(
      Phaser.Display.Color.IntegerToColor(data.colorHex).clone().darken(85)
        .color,
      1
    );
    bg.fillRoundedRect(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT,
      10
    );
    bg.lineStyle(3, data.colorHex, 1);
    bg.strokeRoundedRect(
      -CARD_WIDTH / 2,
      -CARD_HEIGHT / 2,
      CARD_WIDTH,
      CARD_HEIGHT,
      10
    );

    const icon = scene.add
      .image(0, -34, data.iconKey)
      .setDisplaySize(36, 36)
      .setTint(data.colorHex);

    const label = scene.add
      .text(0, 4, data.label, {
        fontSize: '15px',
        fontFamily: 'Cinzel, serif',
        color: '#e8eaf0',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const owner = scene.add
      .text(0, 32, data.ownerName, {
        fontSize: '11px',
        color: '#8891aa',
      })
      .setOrigin(0.5);

    const points = scene.add
      .text(0, 54, `+${data.points} pts`, {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
        color: '#c8a84b',
        fontStyle: '600',
      })
      .setOrigin(0.5);

    return scene.add.container(0, 0, [bg, icon, label, owner, points]);
  }

  //  Entrance - card flies onto the field
  playIn(onComplete?: () => void) {
    const restY = this.y;

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scale: 1,
      y: restY - 20,
      duration: 400,
      ease: 'Back.Out',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          y: restY,
          duration: 150,
        });
        this.spawnArrivalSpark();
        // Reveal shortly after landing, echoing the React card's tap-to-flip
        this.scene.time.delayedCall(300, () => this.flip(onComplete));
      },
    });
  }

  //  Flip: squash on X, swap face at the midpoint, release
  flip(onComplete?: () => void) {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 150,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.isRevealed = !this.isRevealed;
        this.frontFace.setVisible(!this.isRevealed);
        this.backFace.setVisible(this.isRevealed);

        this.scene.tweens.add({
          targets: this,
          scaleX: 1,
          duration: 150,
          ease: 'Sine.easeOut',
          onComplete: () => onComplete?.(),
        });
      },
    });
  }

  private spawnArrivalSpark() {
    const particles = this.scene.add.particles(this.x, this.y, 'spark', {
      speed: { min: 50, max: 120 },
      lifespan: 400,
      scale: { start: 0.6, end: 0 },
      quantity: 8,
      emitting: false,
    });
    particles.explode(8);
    this.scene.time.delayedCall(500, () => particles.destroy());
  }
}
