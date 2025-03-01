import { GameObject } from './GameObject';

export class Treasure extends GameObject {
  private animationTime: number = 0;
  private glowIntensity: number = 0;
  
  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height, '#FFD700'); // 金色
  }
  
  public update(deltaTime: number): void {
    // 宝箱の輝きアニメーション
    this.animationTime += deltaTime;
    this.glowIntensity = Math.abs(Math.sin(this.animationTime * 2));
  }
  
  public render(ctx: CanvasRenderingContext2D): void {
    // 宝箱の描画（基本の四角形）
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // 宝箱の装飾（蓋）
    ctx.fillStyle = '#8B4513'; // 茶色
    ctx.fillRect(this.x, this.y, this.width, this.height / 3);
    
    // 宝箱の装飾（金具）
    ctx.fillStyle = '#C0C0C0'; // 銀色
    ctx.fillRect(this.x + this.width / 2 - 5, this.y + this.height / 3 - 5, 10, 10);
    
    // 輝きエフェクト
    ctx.fillStyle = `rgba(255, 255, 255, ${this.glowIntensity * 0.3})`;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 
            this.width / 2 + 10 * this.glowIntensity, 0, Math.PI * 2);
    ctx.fill();
  }
} 