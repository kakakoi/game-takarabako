import * as THREE from 'three';

export enum FollowerType {
  NORMAL = 'normal',  // 通常のフォロワー（+1）
  PLUS = 'plus',      // プラスのフォロワー（+N）
  MULTIPLY = 'multiply', // 掛け算のフォロワー（×N）
  ENEMY = 'enemy'     // 敵のフォロワー（-N）
}

export class Follower {
  private model: THREE.Group;
  private position: THREE.Vector3;
  private type: FollowerType;
  private value: number;
  private speed: number = 6;
  private _isCollected: boolean = false;
  
  constructor(scene: THREE.Scene, position: THREE.Vector3, type: FollowerType = FollowerType.NORMAL, value: number = 1) {
    this.position = position.clone();
    this.type = type;
    this.value = value;
    
    // フォロワーモデルの作成
    this.model = new THREE.Group();
    
    // 体の作成
    const bodyGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.25);
    let bodyColor = 0x00ff00; // デフォルト色（通常フォロワー）
    
    switch (type) {
      case FollowerType.NORMAL:
        bodyColor = 0x00ff00; // 緑
        break;
      case FollowerType.PLUS:
        bodyColor = 0x00aaff; // 青
        break;
      case FollowerType.MULTIPLY:
        bodyColor = 0xffaa00; // オレンジ
        break;
      case FollowerType.ENEMY:
        bodyColor = 0xff0000; // 赤
        break;
    }
    
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    this.model.add(body);
    
    // 頭の作成
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1;
    this.model.add(head);
    
    // 腕と脚の作成
    const limbGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const limbMaterial = new THREE.MeshPhongMaterial({ color: bodyColor });
    
    const leftArm = new THREE.Mesh(limbGeometry, limbMaterial);
    leftArm.position.set(-0.25, 0.6, 0);
    this.model.add(leftArm);
    
    const rightArm = new THREE.Mesh(limbGeometry, limbMaterial);
    rightArm.position.set(0.25, 0.6, 0);
    this.model.add(rightArm);
    
    const leftLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    leftLeg.position.set(-0.15, 0.2, 0);
    this.model.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    rightLeg.position.set(0.15, 0.2, 0);
    this.model.add(rightLeg);
    
    // 数字テキストの作成（タイプに応じて）
    if (type !== FollowerType.NORMAL) {
      const textGeometry = new THREE.PlaneGeometry(0.5, 0.5);
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, 64, 64);
        context.font = 'bold 40px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';
        
        let displayText = '';
        switch (type) {
          case FollowerType.PLUS:
            displayText = '+' + value;
            break;
          case FollowerType.MULTIPLY:
            displayText = '×' + value;
            break;
          case FollowerType.ENEMY:
            displayText = '-' + value;
            break;
        }
        
        context.fillText(displayText, 32, 32);
      }
      
      const textTexture = new THREE.CanvasTexture(canvas);
      const textMaterial = new THREE.MeshBasicMaterial({ 
        map: textTexture,
        transparent: true
      });
      
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.set(0, 1.4, 0);
      textMesh.rotation.x = -Math.PI / 2;
      this.model.add(textMesh);
    }
    
    // モデルの位置を設定
    this.model.position.copy(this.position);
    
    // シーンに追加
    scene.add(this.model);
  }
  
  public update(deltaTime: number, leaderPosition?: THREE.Vector3): void {
    if (this._isCollected && leaderPosition) {
      // リーダーの後ろについていく
      const direction = leaderPosition.clone().sub(this.position);
      const distance = direction.length();
      
      if (distance > 0.5) {
        direction.normalize();
        const moveSpeed = this.speed * deltaTime;
        this.position.add(direction.multiplyScalar(moveSpeed));
      }
    }
    
    // モデルの位置を更新
    this.model.position.copy(this.position);
    
    // リーダーの方向を向く
    if (leaderPosition) {
      const lookDirection = new THREE.Vector3().subVectors(leaderPosition, this.position);
      if (lookDirection.length() > 0.1) {
        this.model.lookAt(leaderPosition);
      }
    }
  }
  
  public checkCollision(playerPosition: THREE.Vector3, collectionRadius: number): boolean {
    const distance = this.position.distanceTo(playerPosition);
    return distance < collectionRadius;
  }
  
  public collect(): void {
    this._isCollected = true;
  }
  
  public isCollected(): boolean {
    return this._isCollected;
  }
  
  public getType(): FollowerType {
    return this.type;
  }
  
  public getValue(): number {
    return this.value;
  }
  
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }
  
  public remove(scene: THREE.Scene): void {
    scene.remove(this.model);
  }
} 