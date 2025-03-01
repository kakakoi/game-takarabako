import { GameObject } from './GameObject';

export class Trap extends GameObject {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, '#FF0000'); // 赤色
  }

  public update(_deltaTime: number): void {
    // トラップは静的なので何もしない
  }
} 