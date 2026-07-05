import Phaser from 'phaser';
import { Search, HeartHandshake, Shield, Wand2 } from 'lucide-react';
import { Card } from '../objects/Card';
import { lucideIconToDataUrl } from '../../lib/lucide-to-texture';

export interface TurnLogEntry {
  turn: number;
  playerName: string;
  action: string;
  label: string;
  points: number;
  playerClass: 'RANGER' | 'MENDER' | 'WARDER' | 'WEAVER';
  statsAfter: {
    influence: number;
    reputation: number;
    creativity: number;
    trust: number;
  };
  isFinisher: boolean;
}

export interface DuelLogPayload {
  challengerName: string;
  challengedName: string;
  winnerName: string;
  turns: TurnLogEntry[];
}

const CLASS_COLOR: Record<TurnLogEntry['playerClass'], number> = {
  RANGER: 0xe07b39,
  MENDER: 0x5bad6f,
  WARDER: 0x4a90d9,
  WEAVER: 0x9b59b6,
};

// One icon per class — same icons used in the React screens (TrialPlayView,
// ClassCard) so the visual language matches across the whole app.
const CLASS_ICON_KEY: Record<TurnLogEntry['playerClass'], string> = {
  RANGER: 'icon-ranger',
  MENDER: 'icon-mender',
  WARDER: 'icon-warder',
  WEAVER: 'icon-weaver',
};

export class BoardScene extends Phaser.Scene {
  private log!: DuelLogPayload;
  private turnIndex = 0;
  private influenceText!: Phaser.GameObjects.Text;

  constructor() {
    super('BoardScene');
  }

  init(data: { log: DuelLogPayload }) {
    this.log = data.log;
    this.turnIndex = 0;
  }

  preload() {
    // Card back logo — same asset used on the app's other screens
    this.load.image('card-logo', '/logo.png');

    // Convert lucide-react icons to SVG textures Phaser can render.
    // Colors baked in at load time so no runtime tint math is needed later
    // (tint is still applied in Card.ts for consistency, but base art is white).
    this.load.svg('icon-ranger', lucideIconToDataUrl(Search, '#ffffff', 64), {
      width: 64,
      height: 64,
    });
    this.load.svg(
      'icon-mender',
      lucideIconToDataUrl(HeartHandshake, '#ffffff', 64),
      { width: 64, height: 64 }
    );
    this.load.svg('icon-warder', lucideIconToDataUrl(Shield, '#ffffff', 64), {
      width: 64,
      height: 64,
    });
    this.load.svg('icon-weaver', lucideIconToDataUrl(Wand2, '#ffffff', 64), {
      width: 64,
      height: 64,
    });

    // Runtime-generated particle texture — no asset file needed
    const g = this.add.graphics();
    g.fillStyle(0xc8a84b, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('spark', 8, 8);
    g.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0f14');

    this.add
      .text(this.scale.width / 2, 24, 'CONVERSATION DUEL', {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#c8a84b',
      })
      .setOrigin(0.5);

    this.add
      .text(
        this.scale.width / 2,
        52,
        `${this.log.challengerName}  vs  ${this.log.challengedName}`,
        { fontSize: '14px', color: '#8891aa' }
      )
      .setOrigin(0.5);

    this.influenceText = this.add
      .text(this.scale.width / 2, 80, '', {
        fontSize: '13px',
        color: '#e8eaf0',
      })
      .setOrigin(0.5);

    this.time.delayedCall(500, () => this.playNextTurn());
  }

  private playNextTurn() {
    if (this.turnIndex >= this.log.turns.length) {
      this.showWinner();
      return;
    }

    const entry = this.log.turns[this.turnIndex];
    if (!entry) {
      this.showWinner();
      return;
    }
    const x = 140 + (this.turnIndex % 4) * 150;
    const y = 200 + Math.floor(this.turnIndex / 4) * 200;

    const card = new Card(this, x, y, {
      action: entry.action,
      label: entry.label,
      iconKey: CLASS_ICON_KEY[entry.playerClass],
      colorHex: CLASS_COLOR[entry.playerClass],
      ownerName: entry.playerName,
      points: entry.points,
    });

    card.playIn(() => {
      this.influenceText.setText(
        `Influence ${entry.statsAfter.influence} · Trust ${entry.statsAfter.trust} · ` +
          `Reputation ${entry.statsAfter.reputation} · Creativity ${entry.statsAfter.creativity}`
      );

      if (entry.isFinisher) {
        this.cameras.main.flash(300, 200, 168, 75);
      }

      this.turnIndex++;
      this.time.delayedCall(entry.isFinisher ? 900 : 500, () =>
        this.playNextTurn()
      );
    });
  }

  private showWinner() {
    const banner = this.add
      .text(
        this.scale.width / 2,
        this.scale.height - 60,
        `${this.log.winnerName} wins the Conversation`,
        {
          fontFamily: 'Cinzel, serif',
          fontSize: '18px',
          color: '#c8a84b',
          fontStyle: 'bold',
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({ targets: banner, alpha: 1, duration: 500 });
  }
}
