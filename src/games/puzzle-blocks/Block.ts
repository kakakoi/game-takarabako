import { GameObject } from './GameObject';

export enum BlockType {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple'
}

export class Block extends GameObject {
  private type: BlockType;
  private isMatched: boolean = false;
  private isFalling: boolean = false;
  private targetY: number = 0;
  private fallSpeed: number = 500; // ピクセル/秒

  constructor(x: number, y: number, size: number, type: BlockType) {
    // ブロックタイプに応じた色を設定
    let color = '#FF0000';
    switch (type) {
      case BlockType.RED:
        color = '#FF0000';
        break;
      case BlockType.BLUE:
        color = '#0000FF';
        break;
      case BlockType.GREEN:
        color = '#00FF00';
        break;
      case BlockType.YELLOW:
        color = '#FFFF00';
        break;
      case BlockType.PURPLE:
        color = '#800080';
        break;
    }

    super(x, y, size, size, color);
    this.type = type;
    this.targetY = y;
  }

  public update(deltaTime: number): void {
    // 落下中の場合、目標位置まで移動
    if (this.isFalling) {
      const moveDistance = this.fallSpeed * deltaTime;
      if (this.y + moveDistance >= this.targetY) {
        this.y = this.targetY;
        this.isFalling = false;
      } else {
        this.y += moveDistance;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.isMatched) {
      // マッチしたブロックは点滅効果
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
    }

    // 基本的な描画
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // ブロックの枠線
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // ブロックの光沢効果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + this.width, this.y);
    ctx.lineTo(this.x + this.width * 0.7, this.y + this.height * 0.3);
    ctx.lineTo(this.x, this.y + this.height * 0.3);
    ctx.closePath();
    ctx.fill();

    // 透明度をリセット
    ctx.globalAlpha = 1.0;
  }

  public getType(): BlockType {
    return this.type;
  }

  public setMatched(matched: boolean): void {
    this.isMatched = matched;
  }

  public isMatch(): boolean {
    return this.isMatched;
  }

  public startFalling(targetY: number): void {
    this.targetY = targetY;
    this.isFalling = true;
  }

  public isFallingBlock(): boolean {
    return this.isFalling;
  }
} 