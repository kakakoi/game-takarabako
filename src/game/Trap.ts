import { GameObject } from './GameObject';

export class Trap extends GameObject {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, '#e74c3c'); // 赤色のトラップ
  }

  public update(deltaTime: number): void {
    // トラップは静的なので何もしない
  }
} 