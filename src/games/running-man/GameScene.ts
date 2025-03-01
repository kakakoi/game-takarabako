import * as THREE from 'three';
import { Player } from './Player';
import { Follower, FollowerType } from './Follower';
import { Bridge } from './Bridge';
import { Treasure } from './Treasure';

export enum GameState {
  PLAYING,
  GAME_OVER,
  GAME_CLEAR
}

export class GameScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  
  private player: Player;
  private bridge: Bridge;
  private followers: Follower[] = [];
  private treasure: Treasure;
  
  private gameState: GameState = GameState.PLAYING;
  private score: number = 0;
  private money: number = 0;
  private initialFollowers: number = 1;
  
  private input = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    retry: false
  };
  
  private lastTime: number = 0;
  private uiElement: HTMLElement | null = null;
  private handleResize: () => void;
  
  constructor(canvas: HTMLCanvasElement) {
    // レンダラーの設定
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x87CEEB); // 空色の背景
    this.renderer.shadowMap.enabled = true;
    
    // シーンの作成
    this.scene = new THREE.Scene();
    
    // カメラの設定
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    // 光源の設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // 橋の作成
    this.bridge = new Bridge(this.scene, 200, 5);
    
    // プレイヤーの作成
    this.player = new Player(this.scene, this.camera);
    
    // 宝箱の作成（橋の終点に配置）
    this.treasure = new Treasure(this.scene, new THREE.Vector3(0, 0, -180));
    
    // フォロワーの生成
    this.generateFollowers();
    
    // 入力イベントの設定
    this.setupInputEvents();
    
    // UIの作成
    this.createUI();
    
    // ハンドラをバインド
    this.handleResize = this._handleResize.bind(this);
    
    // ウィンドウリサイズイベントの設定
    window.addEventListener('resize', this.handleResize);
  }
  
  private generateFollowers(): void {
    // 既存のフォロワーをクリア
    for (const follower of this.followers) {
      follower.remove(this.scene);
    }
    this.followers = [];
    
    // 橋の上にランダムにフォロワーを配置
    const followerCount = 50; // 合計フォロワー数
    
    for (let i = 0; i < followerCount; i++) {
      // ランダムな位置
      const x = (Math.random() - 0.5) * 4; // 橋の幅内
      const z = -10 - Math.random() * 160; // 橋の長さに沿って
      const position = new THREE.Vector3(x, 1, z);
      
      // ランダムなタイプ
      let type = FollowerType.NORMAL;
      let value = 1;
      
      const typeRandom = Math.random();
      if (typeRandom < 0.6) {
        type = FollowerType.NORMAL;
        value = 1;
      } else if (typeRandom < 0.75) {
        type = FollowerType.PLUS;
        value = Math.floor(Math.random() * 3) + 2; // 2-4
      } else if (typeRandom < 0.9) {
        type = FollowerType.MULTIPLY;
        value = Math.floor(Math.random() * 2) + 2; // 2-3
      } else {
        type = FollowerType.ENEMY;
        value = Math.floor(Math.random() * 3) + 1; // 1-3
      }
      
      const follower = new Follower(this.scene, position, type, value);
      this.followers.push(follower);
    }
  }
  
  private setupInputEvents(): void {
    // キーボード入力の処理
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'w':
        case 'ArrowUp':
          this.input.forward = true;
          break;
        case 's':
        case 'ArrowDown':
          this.input.backward = true;
          break;
        case 'a':
        case 'ArrowLeft':
          this.input.left = true;
          break;
        case 'd':
        case 'ArrowRight':
          this.input.right = true;
          break;
        case 'r':
        case ' ':
          this.input.retry = true;
          break;
      }
    });
    
    window.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'w':
        case 'ArrowUp':
          this.input.forward = false;
          break;
        case 's':
        case 'ArrowDown':
          this.input.backward = false;
          break;
        case 'a':
        case 'ArrowLeft':
          this.input.left = false;
          break;
        case 'd':
        case 'ArrowRight':
          this.input.right = false;
          break;
        case 'r':
        case ' ':
          this.input.retry = false;
          break;
      }
    });
  }
  
  private createUI(): void {
    // UIコンテナの作成
    this.uiElement = document.createElement('div');
    this.uiElement.style.position = 'absolute';
    this.uiElement.style.top = '10px';
    this.uiElement.style.left = '10px';
    this.uiElement.style.color = 'white';
    this.uiElement.style.fontFamily = 'Arial, sans-serif';
    this.uiElement.style.fontSize = '18px';
    this.uiElement.style.textShadow = '1px 1px 2px black';
    document.body.appendChild(this.uiElement);
  }
  
  private updateUI(): void {
    if (!this.uiElement) return;
    
    if (this.gameState === GameState.PLAYING) {
      this.uiElement.innerHTML = `
        <div>フォロワー: ${this.player.getFollowers()}</div>
        <div>スコア: ${this.score}</div>
      `;
    } else if (this.gameState === GameState.GAME_OVER) {
      this.uiElement.innerHTML = `
        <div style="background-color: rgba(0,0,0,0.7); padding: 20px; border-radius: 10px;">
          <h2>ゲームオーバー</h2>
          <div>最終スコア: ${this.score}</div>
          <div>所持金: ${this.money}</div>
          <div style="margin-top: 20px;">Rキーまたはスペースキーでリトライ</div>
        </div>
      `;
    } else if (this.gameState === GameState.GAME_CLEAR) {
      this.uiElement.innerHTML = `
        <div style="background-color: rgba(0,0,0,0.7); padding: 20px; border-radius: 10px;">
          <h2>ゲームクリア！</h2>
          <div>最終スコア: ${this.score}</div>
          <div>獲得金額: ${this.money}</div>
          <div style="margin-top: 20px;">Rキーまたはスペースキーでリトライ</div>
          <div>初期フォロワー数: ${this.initialFollowers} (お金を使って増やせます)</div>
        </div>
      `;
    }
  }
  
  private _handleResize(): void {
    // ウィンドウサイズ変更時の処理
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  public start(): void {
    // ゲームループの開始
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  private gameLoop(): void {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // 秒単位
    this.lastTime = currentTime;
    
    // ゲーム状態に応じた更新
    if (this.gameState === GameState.PLAYING) {
      this.update(deltaTime);
    } else {
      // ゲームオーバーまたはクリア状態
      if (this.input.retry) {
        this.restart();
      }
    }
    
    // 描画
    this.render();
    
    // 次のフレームを要求
    requestAnimationFrame(() => this.gameLoop());
  }
  
  private update(deltaTime: number): void {
    // プレイヤーの更新
    this.player.update(deltaTime, this.input);
    
    // 橋の更新
    this.bridge.update(this.player.getPosition());
    
    // 橋の境界チェック
    if (!this.bridge.checkBoundary(this.player.getPosition())) {
      this.gameState = GameState.GAME_OVER;
    }
    
    // フォロワーの更新と衝突判定
    const playerPosition = this.player.getPosition();
    const collectionRadius = 1.0;
    
    for (const follower of this.followers) {
      if (!follower.isCollected()) {
        // 衝突判定
        if (follower.checkCollision(playerPosition, collectionRadius)) {
          follower.collect();
          
          // フォロワータイプに応じた処理
          switch (follower.getType()) {
            case FollowerType.NORMAL:
              this.player.addFollowers(follower.getValue());
              this.score += follower.getValue();
              break;
            case FollowerType.PLUS:
              this.player.addFollowers(follower.getValue());
              this.score += follower.getValue();
              break;
            case FollowerType.MULTIPLY:
              this.player.multiplyFollowers(follower.getValue());
              this.score = this.score * follower.getValue();
              break;
            case FollowerType.ENEMY:
              this.player.addFollowers(-follower.getValue());
              this.score -= follower.getValue();
              break;
          }
        }
      }
      
      // フォロワーの更新
      follower.update(deltaTime, playerPosition);
    }
    
    // 宝箱の更新と衝突判定
    this.treasure.update(deltaTime);
    
    if (!this.treasure.isOpened() && this.treasure.checkCollision(playerPosition, collectionRadius)) {
      const reward = this.treasure.open(this.player.getFollowers());
      this.money += reward;
      this.score += reward;
      this.gameState = GameState.GAME_CLEAR;
    }
    
    // UIの更新
    this.updateUI();
  }
  
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  private restart(): void {
    // ゲームをリスタート
    if (this.gameState === GameState.GAME_CLEAR) {
      // クリア後は初期フォロワー数を増やせる
      if (this.money >= 100) {
        this.initialFollowers += 1;
        this.money -= 100;
      }
    }
    
    // ゲーム状態をリセット
    this.gameState = GameState.PLAYING;
    this.score = 0;
    
    // プレイヤーの位置をリセット
    this.player.setPosition(new THREE.Vector3(0, 1, 0));
    this.player.setFollowers(this.initialFollowers);
    
    // フォロワーを再生成
    this.generateFollowers();
    
    // 宝箱をリセット（新しいものを作成）
    if (this.treasure) {
      this.scene.remove(this.treasure.model);
    }
    this.treasure = new Treasure(this.scene, new THREE.Vector3(0, 0, -180));
  }
  
  public dispose(): void {
    // リソースの解放
    if (this.uiElement && this.uiElement.parentNode) {
      this.uiElement.parentNode.removeChild(this.uiElement);
    }
    
    // Three.jsのリソースを解放
    this.isRunning = false;
    
    // シーンからオブジェクトを削除
    while(this.scene.children.length > 0) { 
      const object = this.scene.children[0];
      this.scene.remove(object);
    }
    
    // レンダラーの破棄
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer.domElement.remove();
      // @ts-ignore
      this.renderer = null;
    }
    
    // イベントリスナーの削除
    window.removeEventListener('resize', this.handleResize);
  }
} 