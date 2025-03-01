import { Scene, Game } from '../../engine/Game';
import { Input, Key } from '../../engine/Input';
import { Physics } from '../../engine/Physics';
import { Player } from './Player';
import { Ground } from './Ground';
import { Trap } from './Trap';
import { Treasure } from './Treasure';
import { MenuScene } from '../menu/MenuScene';

enum GameState {
  PLAYING,
  GAME_OVER,
  GAME_CLEAR
}

export class GameScene implements Scene {
  private game: Game | null = null;
  private player: Player | null = null;
  private grounds: Ground[] = [];
  private traps: Trap[] = [];
  private treasure: Treasure | null = null;
  private gameState: GameState = GameState.PLAYING;
  private startTime: number = 0;
  private endTime: number = 0;
  private cameraX: number = 0;
  private levelWidth: number = 3000; // レベルの幅
  private autoScrollSpeed: number = 150; // 自動スクロール速度（元の値に戻す）
  private retryKeyReleased: boolean = true; // リトライキーが離されたかどうか
  private autoMoveSpeed: number = 200; // プレイヤーの自動移動速度
  private backToMenuRequested: boolean = false; // メニューに戻るリクエスト

  public init(game: Game): void {
    this.game = game;
    this.startTime = performance.now();
    this.gameState = GameState.PLAYING;
    this.cameraX = 0; // カメラ位置をリセット
    this.retryKeyReleased = true;
    this.backToMenuRequested = false;
    
    const canvas = game.getCanvas();
    const groundY = canvas.height - 50;
    
    // キャンバスをInputクラスに設定（タッチ操作用）
    Input.getInstance().setCanvas(canvas);
    
    // プレイヤーの作成
    this.player = new Player(50, groundY - 40, 30, 40, groundY);
    
    // 地面の作成
    this.grounds = [];
    
    // メインの地面
    this.grounds.push(new Ground(0, groundY, 500, 50));
    this.grounds.push(new Ground(600, groundY, 400, 50));
    this.grounds.push(new Ground(1100, groundY, 300, 50));
    this.grounds.push(new Ground(1500, groundY, 200, 50));
    this.grounds.push(new Ground(1800, groundY, 400, 50));
    this.grounds.push(new Ground(2300, groundY, 700, 50));
    
    // 足場
    this.grounds.push(new Ground(550, groundY - 100, 100, 20));
    this.grounds.push(new Ground(1050, groundY - 120, 80, 20));
    this.grounds.push(new Ground(1450, groundY - 150, 70, 20));
    this.grounds.push(new Ground(1750, groundY - 180, 60, 20));
    
    // トラップの作成
    this.traps = [];
    this.traps.push(new Trap(500, groundY - 10, 100, 10));
    this.traps.push(new Trap(1000, groundY - 10, 100, 10));
    this.traps.push(new Trap(1400, groundY - 10, 100, 10));
    this.traps.push(new Trap(1700, groundY - 10, 100, 10));
    this.traps.push(new Trap(2200, groundY - 10, 100, 10));
    
    // 宝箱の作成
    this.treasure = new Treasure(2800, groundY - 50, 50, 50);
  }

  public update(deltaTime: number): void {
    const input = Input.getInstance();
    
    // ESCキーでメニューに戻る
    if (input.isKeyPressed(Key.ESC)) {
      this.backToMenuRequested = true;
    }
    
    // メニューに戻るリクエストがあれば処理
    if (this.backToMenuRequested) {
      this.returnToMenu();
      return;
    }
    
    // ゲームオーバー時のリトライ処理
    if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.GAME_CLEAR) {
      // スペースキー、上矢印キー、またはタッチリトライでリトライ
      if ((input.isKeyPressed(Key.SPACE) || input.isKeyPressed(Key.UP) || input.isKeyPressed(Key.R) || 
           input.isKeyPressed(Key.TOUCH_RETRY)) && this.retryKeyReleased) {
        this.reset();
        return;
      }
      
      // リトライキーが離されたかどうかを更新
      if (input.isKeyReleased(Key.SPACE) || input.isKeyReleased(Key.UP) || input.isKeyReleased(Key.R) || 
          input.isKeyReleased(Key.TOUCH_RETRY)) {
        this.retryKeyReleased = true;
      }
      
      return;
    }
    
    if (!this.player) return;
    
    // プレイヤーの更新
    this.player.update(deltaTime);
    
    // モバイルデバイスの場合は自動前進
    if (this.isMobileDevice()) {
      // 自動前進（右に移動）
      this.player.setVelocityX(this.player.getMoveSpeed() * 0.7); // 少し遅めに移動
      
      // 戻るボタンのタッチ判定
      if (input.isKeyJustPressed(Key.TOUCH_JUMP)) {
        const touchX = input.getTouchX();
        const touchY = input.getTouchY();
        
        // 戻るボタンの領域をチェック
        if (touchX >= 10 && touchX <= 110 && touchY >= 30 && touchY <= 70) {
          this.backToMenuRequested = true;
          return;
        }
      }
    }
    
    // タッチ入力の処理（ジャンプのみ）
    if (input.isKeyPressed(Key.TOUCH_JUMP) && this.player.isOnGroundState()) {
      this.player.jump();
    }
    
    // プレイヤーが地面に接地しているかどうかのフラグ
    let isOnAnyGround = false;
    
    // 地面との衝突判定（改善版）
    for (const ground of this.grounds) {
      // プレイヤーが地面の上にいて、落下中である場合
      if (
        this.player.getVelocityY() > 0 && // 落下中
        this.player.getY() + this.player.getHeight() >= ground.getY() - 5 && 
        this.player.getY() + this.player.getHeight() <= ground.getY() + 10 && // 地面の少し上から少し下まで
        this.player.getX() + this.player.getWidth() > ground.getX() &&
        this.player.getX() < ground.getX() + ground.getWidth()
      ) {
        // 地面の上に位置を修正
        this.player.setPosition(this.player.getX(), ground.getY() - this.player.getHeight());
        this.player.setVelocityY(0);
        this.player.setOnGround(true);
        isOnAnyGround = true;
        break;
      }
    }
    
    // どの地面にも接地していない場合かつ、基本地面にも接地していない場合
    if (!isOnAnyGround && !this.player.isOnGroundState()) {
      this.player.setOnGround(false);
    }
    
    // トラップとの衝突判定
    for (const trap of this.traps) {
      if (Physics.checkCollision(this.player.getRect(), trap.getRect())) {
        this.gameState = GameState.GAME_OVER;
        this.endTime = performance.now();
        this.retryKeyReleased = false; // リトライキーが押されていることを記録
        return;
      }
    }
    
    // 宝箱との衝突判定
    if (this.treasure && Physics.checkCollision(this.player.getRect(), this.treasure.getRect())) {
      this.gameState = GameState.GAME_CLEAR;
      this.endTime = performance.now();
      this.retryKeyReleased = false; // リトライキーが押されていることを記録
      return;
    }
    
    // 画面外に落下した場合
    if (this.player && this.game && this.player.getY() > this.game.getCanvas().height) {
      this.gameState = GameState.GAME_OVER;
      this.endTime = performance.now();
      this.retryKeyReleased = false; // リトライキーが押されていることを記録
      return;
    }
    
    // 自動スクロールの適用
    this.cameraX += this.autoScrollSpeed * deltaTime;
    
    // プレイヤーが画面左端に近づきすぎないようにする
    const minPlayerX = this.cameraX + 50;
    if (this.player.getX() < minPlayerX) {
      this.player.setPosition(minPlayerX, this.player.getY());
    }
    
    // カメラの範囲制限（最大値の制限を削除して、常にスクロールするようにする）
    if (this.cameraX < 0) {
      this.cameraX = 0;
    }
    
    // ゴールが近づいたらプレイヤーを自動で前進させる
    if (this.treasure && this.game && this.cameraX > this.levelWidth - this.game.getCanvas().width - 100) {
      // プレイヤーを自動で右に移動
      const newX = this.player.getX() + this.autoMoveSpeed * deltaTime;
      this.player.setPosition(newX, this.player.getY());
    }
    
    // 入力の更新
    input.update();
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.game || !this.player) return;
    
    const canvas = this.game.getCanvas();
    
    // 背景のクリア
    ctx.fillStyle = '#87CEEB'; // 空色
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // カメラの位置を設定
    ctx.save();
    ctx.translate(-this.cameraX, 0);
    
    // 地面の描画
    for (const ground of this.grounds) {
      ground.render(ctx);
    }
    
    // トラップの描画
    for (const trap of this.traps) {
      trap.render(ctx);
    }
    
    // 宝箱の描画
    if (this.treasure) {
      this.treasure.render(ctx);
    }
    
    // プレイヤーの描画
    this.player.render(ctx);
    
    ctx.restore();
    
    // UIの描画
    this.renderUI(ctx);
  }
  
  // UIの描画
  private renderUI(ctx: CanvasRenderingContext2D): void {
    if (!this.game) return;
    
    const canvas = this.game.getCanvas();
    
    // ゲームオーバー画面
    if (this.gameState === GameState.GAME_OVER) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2 - 40);
      
      ctx.font = '24px Arial';
      if (this.isMobileDevice()) {
        ctx.fillText('画面をタップしてリトライ', canvas.width / 2, canvas.height / 2 + 20);
      } else {
        ctx.fillText('スペースキーでリトライ', canvas.width / 2, canvas.height / 2 + 20);
      }
      
      // メニューに戻るボタンの表示
      ctx.font = '18px Arial';
      ctx.fillText('ESCキーでメニューに戻る', canvas.width / 2, canvas.height / 2 + 60);
    }
    
    // ゲームクリア画面
    if (this.gameState === GameState.GAME_CLEAR) {
      const elapsedTime = (this.endTime - this.startTime) / 1000;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ゲームクリア！', canvas.width / 2, canvas.height / 2 - 60);
      
      ctx.font = '24px Arial';
      ctx.fillText(`クリア時間: ${elapsedTime.toFixed(2)}秒`, canvas.width / 2, canvas.height / 2);
      
      if (this.isMobileDevice()) {
        ctx.fillText('画面をタップしてリトライ', canvas.width / 2, canvas.height / 2 + 40);
      } else {
        ctx.fillText('スペースキーでリトライ', canvas.width / 2, canvas.height / 2 + 40);
      }
      
      // メニューに戻るボタンの表示
      ctx.font = '18px Arial';
      ctx.fillText('ESCキーでメニューに戻る', canvas.width / 2, canvas.height / 2 + 80);
    }
    
    // プレイ中のメニューボタン表示
    if (this.gameState === GameState.PLAYING) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('ESC: メニューに戻る', 10, 20);
      
      // モバイルデバイス用の戻るボタン
      if (this.isMobileDevice()) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        ctx.fillRect(10, 30, 100, 40);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('戻る', 60, 55);
      }
    }
  }
  
  // メニューに戻る処理
  private returnToMenu(): void {
    if (!this.game) return;
    
    // メニューシーンを作成して設定
    const menuScene = new MenuScene();
    this.game.setScene(menuScene);
  }
  
  // モバイルデバイスかどうかを判定
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private reset(): void {
    if (this.game) {
      this.init(this.game);
    }
  }
} 