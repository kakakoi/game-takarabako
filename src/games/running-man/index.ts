import { GameScene } from './GameScene';

export function initRunningManGame(parentCanvas: HTMLCanvasElement): () => void {
  // 既存のキャンバスは使わず、新しいキャンバスを作成
  const container = parentCanvas.parentElement;
  if (!container) {
    console.error('親要素が見つかりません');
    throw new Error('親要素が見つかりません');
  }
  
  // 既存のキャンバスを非表示にする
  parentCanvas.style.display = 'none';
  
  // 新しいキャンバスを作成
  const canvas = document.createElement('canvas');
  canvas.id = 'running-man-canvas';
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);
  
  // キャンバスのサイズを設定
  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  
  // 初期サイズを設定
  resizeCanvas();
  
  // リサイズイベントの設定
  window.addEventListener('resize', resizeCanvas);
  
  // ゲームシーンの作成
  const gameScene = new GameScene(canvas);
  
  // ゲームの開始
  gameScene.start();
  
  // クリーンアップ関数を返す
  return () => {
    gameScene.dispose();
    window.removeEventListener('resize', resizeCanvas);
    
    // キャンバスを削除
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }
    
    // 元のキャンバスを表示に戻す
    parentCanvas.style.display = 'block';
  };
} 