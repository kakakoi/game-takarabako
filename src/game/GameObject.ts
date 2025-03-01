import { Rectangle } from '../engine/Physics';

export abstract class GameObject {
  protected x: number;
  protected y: number;
  protected width: number;
  protected height: number;
  protected color: string;

  constructor(x: number, y: number, width: number, height: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  public abstract update(deltaTime: number): void;

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  public getRect(): Rectangle {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
} 