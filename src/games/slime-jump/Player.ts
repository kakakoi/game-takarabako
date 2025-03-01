import { GameObject } from './GameObject';
import { Input, Key } from '../../engine/Input';
import { Physics } from '../../engine/Physics';

export class Player extends GameObject {
  private velocity: { x: number; y: number };
  private isJumping: boolean;
  private isOnGround: boolean;
  private jumpForce: number;
  private moveSpeed: number;
  private gravity: number;
  private groundY: number;
  private animationTime: number = 0; // アニメーション用の時間

  constructor(x: number, y: number, width: number, height: number, groundY: number) {
    super(x, y, width, height, '#66cdaa'); // ミントグリーン色のスライム
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
    
    // アニメーション時間の更新
    this.animationTime += deltaTime;
    
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

  public render(ctx: CanvasRenderingContext2D): void {
    // スライムの体（半円）
    ctx.fillStyle = this.color;
    
    // ジャンプ中は少し縦長に、着地時は少し横長に
    let squishFactor = 1.0;
    if (this.isJumping) {
      squishFactor = 1.1; // 縦長
    } else if (this.isOnGround) {
      squishFactor = 0.9 + 0.1 * Math.sin(this.animationTime * 5); // 着地時は少し上下に動く
    }
    
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radiusX = this.width / 2;
    const radiusY = this.height / 2 * squishFactor;
    
    // スライムの体を描画
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // スライムの目（2つ）
    ctx.fillStyle = '#ffffff'; // 白目
    const eyeRadius = this.width / 8;
    const eyeOffsetX = this.width / 5;
    const eyeOffsetY = -this.height / 8;
    
    // 左目
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, centerY + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 右目
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX, centerY + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 瞳（黒目）
    ctx.fillStyle = '#000000';
    const pupilRadius = eyeRadius / 2;
    
    // 移動方向によって瞳の位置を変える
    let pupilOffsetX = 0;
    if (this.velocity.x > 0) {
      pupilOffsetX = pupilRadius / 2; // 右を向く
    } else if (this.velocity.x < 0) {
      pupilOffsetX = -pupilRadius / 2; // 左を向く
    }
    
    // 左瞳
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX + pupilOffsetX, centerY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 右瞳
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetX + pupilOffsetX, centerY + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 猫口（ω）の追加
    const mouthY = centerY + this.height / 5;
    const mouthWidth = this.width / 4;
    const mouthHeight = this.height / 10;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // 「ω」の形を描画
    ctx.moveTo(centerX - mouthWidth / 2, mouthY - mouthHeight / 3);
    ctx.bezierCurveTo(
      centerX - mouthWidth / 4, mouthY + mouthHeight / 2,
      centerX, mouthY - mouthHeight / 4,
      centerX, mouthY
    );
    ctx.bezierCurveTo(
      centerX, mouthY - mouthHeight / 4,
      centerX + mouthWidth / 4, mouthY + mouthHeight / 2,
      centerX + mouthWidth / 2, mouthY - mouthHeight / 3
    );
    
    ctx.stroke();
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

  public setVelocityX(x: number): void {
    this.velocity.x = x;
  }

  public getMoveSpeed(): number {
    return this.moveSpeed;
  }

  public jump(): void {
    if (this.isOnGround) {
      this.velocity.y = this.jumpForce;
      this.isJumping = true;
      this.isOnGround = false;
    }
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
    this.animationTime = 0;
  }
} 