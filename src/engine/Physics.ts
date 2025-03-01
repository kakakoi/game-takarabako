export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Physics {
  /**
   * 2つの矩形が衝突しているかどうかを判定します
   */
  public static checkCollision(rect1: Rectangle, rect2: Rectangle): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * 点が矩形の中にあるかどうかを判定します
   */
  public static isPointInRect(x: number, y: number, rect: Rectangle): boolean {
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    );
  }

  /**
   * 重力を適用します
   */
  public static applyGravity(
    velocity: { y: number },
    gravity: number,
    deltaTime: number
  ): void {
    velocity.y += gravity * deltaTime;
  }

  /**
   * 地面との衝突を処理します
   */
  public static handleGroundCollision(
    position: { y: number },
    velocity: { y: number },
    objectHeight: number,
    groundY: number
  ): boolean {
    if (position.y + objectHeight > groundY) {
      position.y = groundY - objectHeight;
      velocity.y = 0;
      return true;
    }
    return false;
  }
} 