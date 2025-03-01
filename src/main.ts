import './style.css'
import { Game } from './engine/Game'
import { MenuScene } from './games/menu/MenuScene'

// DOMContentLoadedイベントでゲームを初期化
document.addEventListener('DOMContentLoaded', () => {
  try {
    // ゲームインスタンスの作成
    const game = new Game('game-canvas')
    
    // メニューシーンの作成と設定
    const menuScene = new MenuScene()
    game.setScene(menuScene)
    
    // ゲームの開始
    game.start()
    
    console.log('ゲームが正常に開始されました')
  } catch (error) {
    console.error('ゲームの初期化中にエラーが発生しました:', error)
  }
})
