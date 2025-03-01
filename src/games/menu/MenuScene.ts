import { Scene, Game } from '../../engine/Game';
import { Input, Key } from '../../engine/Input';

interface GameOption {
  title: string;
  description: string;
  sceneName: string;
}

export class MenuScene implements Scene {
  private game: Game | null = null;
  private gameOptions: GameOption[] = [];
  private selectedIndex: number = 0;

  constructor() {
    // ゲームオプションの設定
    this.gameOptions = [
      {
        title: 'スライムジャンプ',
        description: '宝箱を目指して障害物を避けながらジャンプするゲーム',
        sceneName: 'slime-jump'
      },
      // 将来的に他のゲームを追加する場合はここに追加
    ];
  }

  public init(game: Game): void {
    this.game = game;
    this.selectedIndex = 0;
  }

  public update(_deltaTime: number): void {
    const input = Input.getInstance();

    // 上下キーで選択を変更
    if (input.isKeyPressed(Key.UP) && this.selectedIndex > 0) {
      this.selectedIndex--;
    }
    if (input.isKeyPressed(Key.DOWN) && this.selectedIndex < this.gameOptions.length - 1) {
      this.selectedIndex++;
    }

    // スペースキーまたはタッチで選択したゲームを開始
    if (input.isKeyPressed(Key.SPACE) || input.isKeyPressed(Key.TOUCH_JUMP)) {
      this.startSelectedGame();
    }

    // 入力の更新
    input.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.game) return;

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
      ctx.fillText('↑↓キーで選択、スペースキーで決定', canvas.width / 2, canvas.height - 50);
    }
  }
  
  private startSelectedGame(): void {
    if (!this.game) return;
    
    const selectedOption = this.gameOptions[this.selectedIndex];
    
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
    }
    // 将来的に他のゲームを追加する場合はここに条件分岐を追加
  }
  
  // モバイルデバイスかどうかを判定
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
} 