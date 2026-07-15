import Phaser from 'phaser';
import { BoardScene } from './scenes/BoardScene';
import type { DuelLogPayload } from './scenes/BoardScene';

export function createDuelGame(
  parentEl: HTMLDivElement,
  log: DuelLogPayload
): Phaser.Game {
  const resize = () => {
    const { width, height } = parentEl.getBoundingClientRect();

    game.scale.resize(Math.floor(width), Math.floor(height));
  };

  const { width, height } = parentEl.getBoundingClientRect();

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentEl,
    backgroundColor: '#0d0f14',

    width: Math.floor(width),
    height: Math.floor(height),

    scene: [BoardScene],

    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    render: {
      antialias: true,
      antialiasGL: true,
      pixelArt: false,
      roundPixels: false,
      powerPreference: 'high-performance',
    },
  });

  game.canvas.style.display = 'block';
  game.canvas.style.width = '100%';
  game.canvas.style.height = '100%';

  game.scene.start('BoardScene', { log });

  const observer = new ResizeObserver(resize);
  observer.observe(parentEl);

  game.events.once(Phaser.Core.Events.DESTROY, () => {
    observer.disconnect();
  });

  return game;
}
