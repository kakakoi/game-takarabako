import { GameObject } from './GameObject';
import { Input, Key } from '../engine/Input';
import { Physics } from '../engine/Physics';

export class Player extends GameObject {
  private velocity: { x: number; y: number };
  private isJumping: boolean;
  private isOnGround: boolean;
  private jumpForce: number;
  private moveSpeed: number;
  private gravity: number;
  private groundY: number;

  constructor(x: number, y: number, width: number, height: number, groundY: number) {
    super(x, y, width, height, '#3498db'); // 青色のプレイヤー
    this.velocity = { x: 0, y: 0 };
    this.isJumping = false;
    this.isOnGround = true; // 初期状態では地面に接地している
    this.jumpForce = -550; // ジャンプ力（負の値で上方向）- 強化
    this.moveSpeed = 250; // 移動速度 - 強化
    this.gravity = 980; // 重力加速度
    this.groundY = groundY;
  }

  public update(deltaTime: number): void {
    const input = Input.getInstance();
    
    // 左右移動
    this.velocity.x = 0;
    if (input.isKeyDown(Key.LEFT)) {
      this.velocity.x = -this.moveSpeed;
    }
    if (input.isKeyDown(Key.RIGHT)) {
      this.velocity.x = this.moveSpeed;
    }
    
    // ジャンプ処理
    if ((input.isKeyPressed(Key.UP) || input.isKeyPressed(Key.SPACE)) && this.isOnGround) {
      this.velocity.y = this.jumpForce;
      this.isJumping = true;
      this.isOnGround = false;
    }
    
    // 重力の適用
    Physics.applyGravity(this.velocity, this.gravity, deltaTime);
    
    // 位置の更新
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
    
    // 基本の地面との衝突判定（GameSceneでより詳細な判定を行う）
    if (this.y + this.height > this.groundY) {
      this.y = this.groundY - this.height;
      this.velocity.y = 0;
      this.isOnGround = true;
      this.isJumping = false;
    }
    
    // 画面外に出ないようにする
    if (this.x < 0) {
      this.x = 0;
    }
  }

  public isJumpingState(): boolean {
    return this.isJumping;
  }

  public getVelocityY(): number {
    return this.velocity.y;
  }

  public setVelocityY(y: number): void {
    this.velocity.y = y;
  }

  public setOnGround(isOnGround: boolean): void {
    this.isOnGround = isOnGround;
    if (isOnGround) {
      this.isJumping = false;
    }
  }

  public isOnGroundState(): boolean {
    return this.isOnGround;
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.isJumping = false;
    this.isOnGround = true; // リセット時は地面に接地している
  }
} 