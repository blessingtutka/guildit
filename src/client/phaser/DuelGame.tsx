import Phaser from 'phaser';
import { BoardScene } from './scenes/BoardScene';
import type { DuelLogPayload } from './scenes/BoardScene';

export function createDuelGame(
  parentEl: HTMLDivElement,
  log: DuelLogPayload
): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    parent: parentEl,
    backgroundColor: '#0d0f14',
    scene: [BoardScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  const game = new Phaser.Game(config);

  // Pass the duel log in once the scene boots
  game.events.once('ready', () => {
    game.scene.start('BoardScene', { log });
  });

  return game;
}
