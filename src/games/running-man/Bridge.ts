import * as THREE from 'three';

export class Bridge {
  private segments: THREE.Group[] = [];
  private length: number;
  private width: number;
  private segmentLength: number = 10;
  private currentSegment: number = 0;
  
  constructor(scene: THREE.Scene, length: number = 100, width: number = 5) {
    this.length = length;
    this.width = width;
    
    // 橋のセグメント数を計算
    const segmentCount = Math.ceil(length / this.segmentLength);
    
    // 橋のセグメントを作成
    for (let i = 0; i < segmentCount; i++) {
      const segment = this.createBridgeSegment(i);
      scene.add(segment);
      this.segments.push(segment);
    }
  }
  
  private createBridgeSegment(index: number): THREE.Group {
    const segment = new THREE.Group();
    
    // 橋の床部分
    const floorGeometry = new THREE.BoxGeometry(this.width, 0.2, this.segmentLength);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8B4513, // 茶色
      shininess: 30
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    
    // 橋の手すり
    const railingHeight = 0.5;
    const railingGeometry = new THREE.BoxGeometry(0.2, railingHeight, this.segmentLength);
    const railingMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    
    const leftRailing = new THREE.Mesh(railingGeometry, railingMaterial);
    leftRailing.position.set(-this.width / 2, railingHeight / 2, 0);
    
    const rightRailing = new THREE.Mesh(railingGeometry, railingMaterial);
    rightRailing.position.set(this.width / 2, railingHeight / 2, 0);
    
    // 橋の支柱
    const pillarCount = 3; // セグメントごとの支柱の数
    const pillarSpacing = this.segmentLength / (pillarCount - 1);
    
    for (let i = 0; i < pillarCount; i++) {
      const pillarGeometry = new THREE.BoxGeometry(0.3, 0.3, this.segmentLength / 10);
      const pillarMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      
      // 左の支柱
      const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      leftPillar.position.set(-this.width / 2, 0, -this.segmentLength / 2 + i * pillarSpacing);
      leftPillar.rotation.x = Math.PI / 2;
      
      // 右の支柱
      const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      rightPillar.position.set(this.width / 2, 0, -this.segmentLength / 2 + i * pillarSpacing);
      rightPillar.rotation.x = Math.PI / 2;
      
      segment.add(leftPillar);
      segment.add(rightPillar);
    }
    
    // セグメントに部品を追加
    segment.add(floor);
    segment.add(leftRailing);
    segment.add(rightRailing);
    
    // セグメントの位置を設定
    segment.position.z = -index * this.segmentLength;
    
    // 橋の装飾（ランダムな要素を追加）
    if (Math.random() > 0.7) {
      const decorationGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
      const decorationMaterial = new THREE.MeshPhongMaterial({ color: 0xDDDDDD });
      const decoration = new THREE.Mesh(decorationGeometry, decorationMaterial);
      
      // ランダムな位置に配置
      const xPos = (Math.random() - 0.5) * (this.width - 1);
      const zPos = (Math.random() - 0.5) * this.segmentLength;
      decoration.position.set(xPos, 0.3, zPos);
      
      segment.add(decoration);
    }
    
    return segment;
  }
  
  public update(playerPosition: THREE.Vector3): void {
    // プレイヤーの位置に基づいて、新しいセグメントを生成または古いセグメントを削除
    const playerSegmentIndex = Math.floor(Math.abs(playerPosition.z) / this.segmentLength);
    
    // プレイヤーが進んだら新しいセグメントを追加
    if (playerSegmentIndex > this.currentSegment) {
      this.currentSegment = playerSegmentIndex;
      
      // 必要に応じて新しいセグメントを追加
      if (this.segments.length < playerSegmentIndex + 5) {
        // 実装は省略（必要に応じて拡張）
      }
    }
  }
  
  public getWidth(): number {
    return this.width;
  }
  
  public getLength(): number {
    return this.length;
  }
  
  public checkBoundary(position: THREE.Vector3): boolean {
    // 橋の境界チェック（プレイヤーが橋から落ちないようにする）
    return Math.abs(position.x) <= this.width / 2;
  }
} 