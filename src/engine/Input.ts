export enum Key {
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  UP = 'ArrowUp',
  SPACE = ' ',
  R = 'r',
  ESC = 'Escape'
}

export class Input {
  private static instance: Input;
  private keys: Map<string, boolean> = new Map();
  private keysPressed: Map<string, boolean> = new Map();
  private keysReleased: Map<string, boolean> = new Map();

  private constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  public static getInstance(): Input {
    if (!Input.instance) {
      Input.instance = new Input();
    }
    return Input.instance;
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

  public isKeyDown(key: string): boolean {
    return !!this.keys.get(key);
  }

  public isKeyPressed(key: string): boolean {
    return !!this.keysPressed.get(key);
  }

  public isKeyReleased(key: string): boolean {
    return !!this.keysReleased.get(key);
  }

  public update(): void {
    // キーの押下・解放状態をリセット
    this.keysPressed.clear();
    this.keysReleased.clear();
  }
} 