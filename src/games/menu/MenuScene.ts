import { Scene, Game } from '../../engine/Game';
import { Input, Key } from '../../engine/Input';
import { initRunningManGame } from "../running-man";
// import { initSlimeJumpGame } from "../slime-jump";

interface GameOption {
  title: string;
  description: string;
  sceneName: string;
}

export class MenuScene implements Scene {
  private game: Game | null = null;
  private gameOptions: GameOption[] = [];
  private selectedIndex: number = 0;
  private cleanupFunction: (() => void) | null = null;
  private input: Input;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {
    // 入力インスタンスを取得
    this.input = Input.getInstance();
    
    // ゲームオプションの設定
    this.gameOptions = [
      {
        title: 'スライムジャンプ',
        description: '宝箱を目指して障害物を避けながらジャンプするゲーム',
        sceneName: 'slime-jump'
      },
      {
        title: '走る男',
        description: '橋の上を進みながら人を集めていくアクションゲーム',
        sceneName: 'running-man'
      },
      // 将来的に他のゲームを追加する場合はここに追加
    ];
    
    console.log('MenuScene initialized with options:', this.gameOptions.length);
  }

  public init(game: Game): void {
    this.game = game;
    this.selectedIndex = 0;
    this.canvas = game.getCanvas();
    console.log('MenuScene init with game:', game);
    
    // タッチイベントを追加
    if (this.isMobileDevice()) {
      this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
      // this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this)); // タッチ終了時のイベントを削除
    }
  }

  public update(deltaTime: number): void {
    // deltaTimeは将来的なアニメーションのために保持
    // 現在のゲームがある場合、そのゲームの更新は行わない
    if (this.cleanupFunction) {
      // ESCキーでメニューに戻る
      if (this.input.isKeyJustPressed(Key.ESCAPE) || this.input.isKeyJustPressed(Key.ESC)) {
        console.log('ESC pressed, returning to menu');
        this.cleanupFunction();
        this.cleanupFunction = null;
      }
      return;
    }

    // 上下キーで選択を変更
    if (this.input.isKeyJustPressed(Key.UP)) {
      console.log('UP pressed');
      this.selectedIndex = (this.selectedIndex - 1 + this.gameOptions.length) % this.gameOptions.length;
    }
    if (this.input.isKeyJustPressed(Key.DOWN)) {
      console.log('DOWN pressed');
      this.selectedIndex = (this.selectedIndex + 1) % this.gameOptions.length;
    }

    // スペースキーまたはエンターキーで選択したゲームを開始
    if (this.input.isKeyJustPressed(Key.ENTER) || this.input.isKeyJustPressed(Key.SPACE)) {
      console.log('ENTER/SPACE pressed, starting game');
      this.startSelectedGame();
    }

    // タッチ入力の処理
    if (this.input.isKeyJustPressed(Key.TOUCH_JUMP) || this.input.isKeyJustPressed(Key.TOUCH_RETRY)) {
      console.log('Touch detected, starting game');
      this.startSelectedGame();
    }
    
    // 入力状態の更新
    this.input.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.game) return;
    
    // 現在のゲームがある場合、メニューは描画しない
    if (this.cleanupFunction) return;

    const canvas = this.game.getCanvas();
    
    // 背景のクリア
    ctx.fillStyle = '#87CEEB'; // 空色
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // タイトルの描画
    ctx.fillStyle = '#000000';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('宝箱への冒険 - ゲーム選択', canvas.width / 2, 80);
    
    // ゲームオプションの描画
    const startY = 150;
    const optionHeight = 100;
    
    this.gameOptions.forEach((option, index) => {
      const y = startY + index * optionHeight;
      
      // 選択中のオプションはハイライト
      if (index === this.selectedIndex) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(50, y - 30, canvas.width - 100, optionHeight - 10);
      }
      
      // ゲームタイトル
      ctx.fillStyle = index === this.selectedIndex ? '#FF0000' : '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(option.title, 70, y);
      
      // ゲーム説明
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.fillText(option.description, 70, y + 30);
    });
    
    // 操作方法の説明
    ctx.fillStyle = '#000000';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    
    if (this.isMobileDevice()) {
      ctx.fillText('タップでゲームを選択', canvas.width / 2, canvas.height - 50);
    } else {
      ctx.fillText('↑↓キーで選択、スペースキーまたはEnterキーで決定', canvas.width / 2, canvas.height - 50);
    }
  }
  
  private startSelectedGame(): void {
    if (!this.game) return;
    
    const selectedOption = this.gameOptions[this.selectedIndex];
    console.log('Starting game:', selectedOption.title);
    
    // 選択されたゲームに応じてシーンを切り替え
    if (selectedOption.sceneName === 'slime-jump') {
      // 動的にSlimeJumpGameSceneをインポートして設定
      import('../slime-jump/GameScene').then(module => {
        const gameScene = new module.GameScene();
        if (this.game) {
          this.game.setScene(gameScene);
        }
      }).catch(error => {
        console.error('ゲームシーンの読み込みに失敗しました:', error);
      });
    } else if (selectedOption.sceneName === 'running-man') {
      try {
        this.cleanupFunction = initRunningManGame(this.game.getCanvas());
        console.log('Running Man game started');
      } catch (error) {
        console.error('Running Man game failed to start:', error);
      }
    }
    // 将来的に他のゲームを追加する場合はここに条件分岐を追加
  }
  
  // モバイルデバイスかどうかを判定
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // タッチイベントハンドラ
  private handleTouchStart(e: TouchEvent): void {
    if (this.cleanupFunction || !this.canvas) return;
    
    e.preventDefault();
    
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // ゲームオプションの領域をチェック
      const startY = 150;
      const optionHeight = 100;
      
      for (let i = 0; i < this.gameOptions.length; i++) {
        const optionY = startY + i * optionHeight;
        
        // タップした位置がオプション領域内かチェック
        if (y >= optionY - 30 && y <= optionY + optionHeight - 40 && 
            x >= 50 && x <= this.canvas.width - 50) {
          this.selectedIndex = i;
          console.log('Selected game via touch:', this.gameOptions[i].title);
          this.startSelectedGame();
          break;
        }
      }
    }
  }

  public dispose(): void {
    // タッチイベントリスナーを削除
    if (this.canvas && this.isMobileDevice()) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
      // this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this)); // タッチ終了時のイベントを削除
    }
  }
} 