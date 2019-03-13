import { GameScene } from "./GameScene";





/**
 * 此模块用于根据逻辑设计出块方案
 */

export class AutoCreator {

    public gameScene: GameScene = null;
    //用于获取棋盘情况
    public maze: number[][] = null;

    public constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
        this.init();
    }

    public init() {
        //获取棋盘可用区域引用
        this.maze = this.gameScene.position.maze;
    }



    
    
}
