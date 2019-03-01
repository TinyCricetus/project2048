import { Position } from "./GameBoard/Position";
import { GameScene } from "./GameBoard/GameScene";
import { GridControl } from "./GameBoard/GridControl";
import { WIDTH, HEIGHT } from "./GameBoard/GridData";

/**
 * 游戏全局逻辑控制
 */
export class GameControl {

    //用于持有坐标的棋盘引用
    public scanMaze: number[][] = null;
    public originPos: cc.Vec2 = null;
    public gridPosMaze: cc.Vec2[][] = null;
    //用于持有背景方块结点
    public bgGridArray: Array<cc.Node> = null;
    //用于持有形状生成器引用
    public gameGrid: cc.Node = null;
    public gameScene: GameScene = null;

    constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
        //初始化
        this.init();
    }

    public init() {
        //获取棋盘方块存在判定数组引用
        this.scanMaze = this.gameScene.position.maze;
        //获取方块坐标信息数组引用
        this.gridPosMaze = this.gameScene.position.realPos;
        //获取数组下标原点
        this.originPos = this.gameScene.position.sourcePos;
        //获取背景方块结点引用
        this.bgGridArray = this.gameScene.gridArray;
        //获取形状生成器引用
        this.gameGrid = this.gameScene.gameGrid;
    }


    /**
     * 扫描棋盘
     * @param scanMaze 棋盘方块可控区域数组
     * @param gridPosMaze  棋盘棋子实际坐标数组
     */
    public judgePos(): void {
        //每次扫描都应该初始化
        let index: number = -1;
        for (let i = 0; i < this.scanMaze.length; i++) {
            for (let j = 0; j < this.scanMaze[i].length; j++) {
                //扫描背景方块
                if (this.scanMaze[i][j] == 0) {
                    index++;
                    let judge: boolean = this.isContain(this.gridPosMaze[i][j]);
                    if (judge) {
                        this.changeGridState(index);
                    }
                }
            }
        }
    }


    public changeGridState(index: number): void {
        cc.log("方块变化啦！");
        for (let i = 0; i < this.bgGridArray.length; i++) {
            if (i == index) {
                this.bgGridArray[i].opacity = 50;
            } else {
                this.bgGridArray[i].opacity = 200;
            }
        }
    }

    public isContain(pos: cc.Vec2): boolean {
        //正在操控方块的坐标信息
        let tempPos = this.gameGrid.position;
        if ((Math.abs(pos.x - tempPos.x) < WIDTH / 2) &&
            (Math.abs(pos.y - tempPos.y) < HEIGHT / 2)) {
            return true;
        }
        return false;
    }

}