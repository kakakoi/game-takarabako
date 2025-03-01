import { GameObject } from './GameObject';

export class Ground extends GameObject {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, '#27ae60'); // 緑色の地面
  }

  public update(deltaTime: number): void {
    // 地面は静的なので何もしない
  }
} 