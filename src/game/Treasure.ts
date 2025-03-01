import { GameObject } from './GameObject';

export class Treasure extends GameObject {
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, '#f1c40f'); // 黄色の宝箱
  }

  public update(deltaTime: number): void {
    // 宝箱は静的なので何もしない
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // 基本の四角形を描画
    super.render(ctx);
    
    // 宝箱の装飾を描画
    ctx.strokeStyle = '#e67e22';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // 宝箱の鍵穴
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 10,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
} 