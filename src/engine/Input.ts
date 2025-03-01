export enum Key {
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  UP = 'ArrowUp',
  DOWN = 'ArrowDown',
  SPACE = ' ',
  ENTER = 'Enter',
  R = 'r',
  ESCAPE = 'Escape',
  ESC = 'Escape',
  // 仮想タッチキー
  TOUCH_JUMP = 'TOUCH_JUMP',
  TOUCH_RETRY = 'TOUCH_RETRY'
}

export class Input {
  private static instance: Input;
  private keys: Map<string, boolean> = new Map();
  private keysPressed: Map<string, boolean> = new Map();
  private keysReleased: Map<string, boolean> = new Map();
  private touchX: number = 0;
  private touchY: number = 0;
  private canvas: HTMLCanvasElement | null = null;

  private constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    
    // タッチイベントの追加
    window.addEventListener('touchstart', (e) => this.onTouchStart(e));
    window.addEventListener('touchend', (e) => this.onTouchEnd(e));
  }

  public static getInstance(): Input {
    if (!Input.instance) {
      Input.instance = new Input();
    }
    return Input.instance;
  }

  // キャンバス要素を設定するメソッド
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  // タッチX座標を取得
  public getTouchX(): number {
    return this.touchX;
  }

  // タッチY座標を取得
  public getTouchY(): number {
    return this.touchY;
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.keys.get(e.key)) {
      this.keysPressed.set(e.key, true);
    }
    this.keys.set(e.key, true);
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keys.set(e.key, false);
    this.keysReleased.set(e.key, true);
  }

  // タッチ開始時の処理
  private onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      
      // タッチ座標を保存
      if (this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        this.touchX = touch.clientX - rect.left;
        this.touchY = touch.clientY - rect.top;
      } else {
        this.touchX = touch.clientX;
        this.touchY = touch.clientY;
      }
      
      // ゲームの状態に応じてジャンプまたはリトライ
      this.simulateKey(Key.TOUCH_JUMP, true);
      this.simulateKey(Key.TOUCH_RETRY, true);
    }
  }

  // タッチ終了時の処理
  private onTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    
    // タッチ仮想キーをリセット
    this.keys.set(Key.TOUCH_JUMP, false);
    
    // リトライキーは押されたままにする（一度タップしたら有効）
    if (this.keys.get(Key.TOUCH_RETRY)) {
      this.keysReleased.set(Key.TOUCH_RETRY, true);
    }
    this.keys.set(Key.TOUCH_RETRY, false);
  }

  // 仮想キーの状態を設定
  private simulateKey(key: string, isDown: boolean): void {
    if (isDown && !this.keys.get(key)) {
      this.keysPressed.set(key, true);
    }
    this.keys.set(key, isDown);
  }

  public isKeyDown(key: string): boolean {
    return !!this.keys.get(key);
  }

  public isKeyPressed(key: string): boolean {
    return !!this.keysPressed.get(key);
  }

  public isKeyReleased(key: string): boolean {
    return !!this.keysReleased.get(key);
  }

  // 新しく追加: キーが今フレームで押されたかどうか
  public isKeyJustPressed(key: string): boolean {
    return !!this.keysPressed.get(key);
  }

  public update(): void {
    // キーの押下・解放状態をリセット
    this.keysPressed.clear();
    this.keysReleased.clear();
  }
} 