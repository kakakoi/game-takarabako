import { Scene, Game } from '../engine/Game';
import { Input, Key } from '../engine/Input';
import { Physics } from '../engine/Physics';
import { Player } from './Player';
import { Ground } from './Ground';
import { Trap } from './Trap';
import { Treasure } from './Treasure';

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
  private autoScrollSpeed: number = 150; // 自動スクロール速度（さらに高速化）
  private retryKeyReleased: boolean = true; // リトライキーが離されたかどうか
  private autoMoveSpeed: number = 200; // プレイヤーの自動移動速度

  public init(game: Game): void {
    this.game = game;
    this.startTime = performance.now();
    this.gameState = GameState.PLAYING;
    this.cameraX = 0; // カメラ位置をリセット
    this.retryKeyReleased = true;
    
    const canvas = game.getCanvas();
    const groundY = canvas.height - 50;
    
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
    
    if (this.gameState !== GameState.PLAYING) {
      // リトライキーが離されたことを確認
      if (!input.isKeyDown(Key.SPACE) && !input.isKeyDown(Key.UP) && !input.isKeyDown(Key.R)) {
        this.retryKeyReleased = true;
      }
      
      // リトライ（Rキー、スペースキー、上矢印キーのいずれかで可能）
      if (this.retryKeyReleased && (input.isKeyPressed(Key.R) || input.isKeyPressed(Key.SPACE) || input.isKeyPressed(Key.UP))) {
        this.gameState = GameState.PLAYING;
        this.reset();
        input.update();
        return;
      }
      
      // ESCキーでゲームを一時停止
      if (input.isKeyPressed(Key.ESC)) {
        if (this.game) {
          this.game.stop();
        }
      }
      
      input.update();
      return;
    }
    
    if (!this.player || !this.game) return;
    
    // プレイヤーの更新（入力処理と物理演算）
    this.player.update(deltaTime);
    
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
    if (this.player.getY() > this.game.getCanvas().height) {
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
    if (this.treasure && this.cameraX > this.levelWidth - this.game.getCanvas().width - 100) {
      // プレイヤーを自動で右に移動
      const newX = this.player.getX() + this.autoMoveSpeed * deltaTime;
      this.player.setPosition(newX, this.player.getY());
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
    
    // カメラの適用
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
    if (this.player) {
      this.player.render(ctx);
    }
    
    ctx.restore();
    
    // ゲームオーバー画面
    if (this.gameState === GameState.GAME_OVER) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2 - 40);
      
      ctx.font = '24px Arial';
      ctx.fillText('スペースキーでリトライ', canvas.width / 2, canvas.height / 2 + 20);
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
      
      ctx.fillText('スペースキーでリトライ', canvas.width / 2, canvas.height / 2 + 40);
    }
  }

  private reset(): void {
    if (this.game) {
      this.init(this.game);
    }
  }
} 