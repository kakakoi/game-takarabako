export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private timeStep: number = 1000 / 60; // 60 FPS
  private isRunning: boolean = false;
  private currentScene: Scene | null = null;

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas with id ${canvasId} not found`);
    }
    this.canvas = canvas;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    
    // キャンバスのサイズを設定
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }
  }

  public setScene(scene: Scene): void {
    this.currentScene = scene;
    scene.init(this);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  public stop(): void {
    this.isRunning = false;
  }

  private gameLoop(timestamp: number): void {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.accumulator += deltaTime;
    
    // 固定タイムステップで更新
    while (this.accumulator >= this.timeStep) {
      this.update(this.timeStep / 1000); // 秒単位に変換
      this.accumulator -= this.timeStep;
    }
    
    // 描画
    this.render();
    
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private update(deltaTime: number): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  private render(): void {
    // キャンバスをクリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.currentScene) {
      this.currentScene.render(this.ctx);
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}

export interface Scene {
  init(game: Game): void;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
} 