import * as THREE from 'three';

export class Treasure {
  public model: THREE.Group;
  private position: THREE.Vector3;
  private isOpen: boolean = false;
  private coins: THREE.Mesh[] = [];
  private value: number = 100; // 宝箱の基本価値
  private lid: THREE.Mesh;
  
  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.position = position.clone();
    this.model = new THREE.Group();
    
    // 宝箱の本体
    const boxGeometry = new THREE.BoxGeometry(1.5, 1, 1);
    const boxMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8B4513, // 茶色
      shininess: 50
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.y = 0.5;
    this.model.add(box);
    
    // 宝箱の蓋
    const lidGeometry = new THREE.BoxGeometry(1.6, 0.3, 1.1);
    const lidMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8B4513, // 茶色
      shininess: 50
    });
    this.lid = new THREE.Mesh(lidGeometry, lidMaterial);
    this.lid.position.y = 0.65;
    this.lid.position.z = -0.05;
    this.lid.castShadow = true;
    this.lid.receiveShadow = true;
    this.model.add(this.lid);
    
    // 宝箱の金具
    const metalGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const metalMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFD700, // 金色
      shininess: 100
    });
    
    const frontMetal = new THREE.Mesh(metalGeometry, metalMaterial);
    frontMetal.position.set(0, 0.7, 0.55);
    this.model.add(frontMetal);
    
    const topMetal = new THREE.Mesh(metalGeometry, metalMaterial);
    topMetal.position.set(0, 1.15, 0.55);
    topMetal.rotation.x = Math.PI / 2;
    this.model.add(topMetal);
    
    // 宝箱の装飾
    const decorationGeometry = new THREE.BoxGeometry(1.6, 0.1, 0.1);
    const decorationMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    
    const topDecoration = new THREE.Mesh(decorationGeometry, decorationMaterial);
    topDecoration.position.set(0, 1.3, 0);
    this.model.add(topDecoration);
    
    const bottomDecoration = new THREE.Mesh(decorationGeometry, decorationMaterial);
    bottomDecoration.position.set(0, 0.1, 0);
    this.model.add(bottomDecoration);
    
    // モデルの位置を設定
    this.model.position.copy(this.position);
    
    // シーンに追加
    scene.add(this.model);
    
    // コインを作成（最初は非表示）
    this.createCoins(scene);
  }
  
  private createCoins(scene: THREE.Scene): void {
    const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
    const coinMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFFD700, // 金色
      shininess: 100
    });
    
    // 10個のコインを作成
    for (let i = 0; i < 10; i++) {
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      
      // コインの初期位置（宝箱の中）
      coin.position.copy(this.position);
      coin.position.y += 0.5;
      
      // コインを回転させる（横向きに）
      coin.rotation.x = Math.PI / 2;
      
      // 最初は非表示
      coin.visible = false;
      
      this.coins.push(coin);
      scene.add(coin);
    }
  }
  
  public open(playerFollowers: number): number {
    if (this.isOpen) return 0;
    
    this.isOpen = true;
    
    // 蓋を開ける（アニメーション）
    this.lid.position.y += 0.2;
    this.lid.position.z -= 0.5;
    this.lid.rotation.x = -Math.PI / 3;
    
    // コインを表示して飛び散らせる
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      coin.visible = true;
      
      // ランダムな方向に飛び散る
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 1.5;
      const x = this.position.x + Math.cos(angle) * radius;
      const z = this.position.z + Math.sin(angle) * radius;
      
      // コインの位置を更新
      coin.position.set(x, this.position.y + 1 + Math.random(), z);
    }
    
    // プレイヤーのフォロワー数に基づいて報酬を計算
    const reward = this.value * (1 + playerFollowers / 10);
    
    return Math.floor(reward);
  }
  
  public update(deltaTime: number): void {
    if (!this.isOpen) return;
    
    // コインのアニメーション
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      
      // コインを回転
      coin.rotation.y += 5 * deltaTime;
      
      // コインを落下
      if (coin.position.y > this.position.y + 0.1) {
        coin.position.y -= 2 * deltaTime;
      }
    }
  }
  
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }
  
  public isOpened(): boolean {
    return this.isOpen;
  }
  
  public checkCollision(playerPosition: THREE.Vector3, radius: number): boolean {
    const distance = this.position.distanceTo(playerPosition);
    return distance < radius + 1.0; // 宝箱のサイズを考慮
  }
} 