import * as THREE from 'three';

export class Player {
  private model: THREE.Group;
  private camera: THREE.PerspectiveCamera;
  private position: THREE.Vector3;
  private rotation: THREE.Euler;
  private speed: number = 5;
  private followers: number = 1; // 初期の人数
  
  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.position = new THREE.Vector3(0, 1, 0);
    this.rotation = new THREE.Euler(0, 0, 0);
    
    // プレイヤーモデルの作成
    this.model = new THREE.Group();
    
    // 体の作成
    const bodyGeometry = new THREE.BoxGeometry(0.5, 1, 0.3);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x3366ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    this.model.add(body);
    
    // 頭の作成
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.25;
    this.model.add(head);
    
    // 腕の作成
    const armGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x3366ff });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.325, 0.75, 0);
    this.model.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.325, 0.75, 0);
    this.model.add(rightArm);
    
    // 脚の作成
    const legGeometry = new THREE.BoxGeometry(0.15, 0.5, 0.15);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, 0.25, 0);
    this.model.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, 0.25, 0);
    this.model.add(rightLeg);
    
    // モデルの位置を設定
    this.model.position.copy(this.position);
    
    // シーンに追加
    scene.add(this.model);
    
    // カメラの初期位置設定
    this.updateCamera();
  }
  
  public update(deltaTime: number, input: { forward: boolean; backward: boolean; left: boolean; right: boolean }): void {
    // 移動処理
    const moveSpeed = this.speed * deltaTime;
    
    if (input.forward) {
      this.position.z -= moveSpeed;
      this.rotation.y = Math.PI;
    }
    if (input.backward) {
      this.position.z += moveSpeed;
      this.rotation.y = 0;
    }
    if (input.left) {
      this.position.x -= moveSpeed;
      this.rotation.y = Math.PI / 2;
    }
    if (input.right) {
      this.position.x += moveSpeed;
      this.rotation.y = -Math.PI / 2;
    }
    
    // モデルの位置と回転を更新
    this.model.position.copy(this.position);
    this.model.rotation.copy(this.rotation);
    
    // カメラの位置を更新
    this.updateCamera();
  }
  
  private updateCamera(): void {
    // プレイヤーの後ろ上から見るカメラ位置
    const cameraOffset = new THREE.Vector3(0, 3, 5);
    const cameraPosition = this.position.clone().add(cameraOffset);
    this.camera.position.copy(cameraPosition);
    
    // プレイヤーを見るようにカメラを向ける
    this.camera.lookAt(this.position);
  }
  
  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }
  
  public setPosition(position: THREE.Vector3): void {
    this.position.copy(position);
    this.model.position.copy(position);
  }
  
  public getFollowers(): number {
    return this.followers;
  }
  
  public addFollowers(count: number): void {
    this.followers += count;
    if (this.followers < 1) this.followers = 1; // 最低1人は確保
  }
  
  public multiplyFollowers(factor: number): void {
    this.followers = Math.floor(this.followers * factor);
    if (this.followers < 1) this.followers = 1; // 最低1人は確保
  }
  
  public setFollowers(count: number): void {
    this.followers = count;
    if (this.followers < 1) this.followers = 1; // 最低1人は確保
  }
} 