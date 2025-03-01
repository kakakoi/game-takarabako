import { GameObject } from './GameObject';

export class Ground extends GameObject {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, '#8B4513'); // 茶色
  }

  public update(_deltaTime: number): void {
    // 地面は静的なので何もしない
  }
} 