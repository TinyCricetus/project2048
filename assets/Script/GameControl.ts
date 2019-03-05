import { Position } from "./GameBoard/Position";
import { GameScene } from "./GameBoard/GameScene";
import { GridControl } from "./GameBoard/GridControl";
import { WIDTH, HEIGHT, NORMAL, SHALLOW, EMPTY, CANNOTPLACE, FULL } from "./GameBoard/GridData";

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
    //用于记录变化的方块在方块数组中的编号(将要落子的方块)
    public changeGrid: Array<number> = null;
    //落子标记，用于判断当前坐标是否能落子
    public canPlace: boolean = false;
    //落子数组位置记录
    public placePos: cc.Vec2 = null;

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
        //初始化记录数组
        this.changeGrid = new Array<number>();
        //初始化落子判断标记
        this.canPlace = false;
        //初始化落子位置记录
        this.placePos = cc.v2();
    }


    /**
     * 扫描棋盘
     * @param scanMaze 棋盘方块可控区域数组
     * @param gridPosMaze  棋盘棋子实际坐标数组
     */
    public judgePos(): void {
        //每次扫描都应该初始化
        let index: number = -1;
        let sign: number = -1;
        for (let i = 0; i < this.scanMaze.length; i++) {
            for (let j = 0; j < this.scanMaze[i].length; j++) {
                //扫描背景方块
                if (this.scanMaze[i][j] != CANNOTPLACE) {
                    index++;
                    let judge: boolean = this.isContain(this.gridPosMaze[i][j]);
                    if (judge) {
                        sign = index;
                        //注意，记录的是在数组中的位置
                        this.placePos.x = i;
                        this.placePos.y = j;
                    }
                }
            }
        }
        //cc.log(sign);
        //如果判定重合就把背景变换状态，未重合就恢复
        if (sign != -1 && this.scanMaze[this.placePos.x][this.placePos.y] == EMPTY) {
            this.changeGridState(sign);
            this.canPlace = true;
        } else {
            this.changeGridState(-1);
        }
    }


    public changeGridState(index: number): void {
        //cc.log("方块变化啦！");
        for (let i = 0; i < this.bgGridArray.length; i++) {
            if (i == index) {
                this.bgGridArray[i].opacity = SHALLOW;
            } else {
                this.bgGridArray[i].opacity = NORMAL;
            }
        }
    }

    /**
     * 判断当前中心坐标是否与背景方块重合
     * @param pos 
     */
    public isContain(pos: cc.Vec2): boolean {
        //正在操控方块的坐标信息
        let tempPos = this.gameGrid.position;
        if ((Math.abs(pos.x - tempPos.x) < WIDTH / 2) &&
            (Math.abs(pos.y - tempPos.y) < HEIGHT / 2)) {
            return true;
        }
        return false;
    }

    //二维数组转一维的位置
    public mazeToArrayIndex(pos: cc.Vec2): number {
        let index: number = -1;
        let stop = false;
        for (let i = 0; i < this.scanMaze.length; i++) {
            for (let j = 0; j < this.scanMaze[i].length; j++) {
                if (this.scanMaze[i][j] != CANNOTPLACE) {
                    index++;
                    if (pos.x == i && pos.y == j) {
                        stop = true;
                        break;
                    }
                }
            }
            if (stop) {
                break;
            }
        }
        return index;
    }

    //一维数组转二维的位置
    public arrayIndexToMaze(index: number): cc.Vec2 {
        let pos: cc.Vec2 = cc.v2();
        let tempIndex: number = -1;
        let stop: boolean = false;
        for (let i = 0; i < this.scanMaze.length; i++) {
            for (let j = 0; j < this.scanMaze[i].length; j++) {
                if (this.scanMaze[i][j] != CANNOTPLACE) {
                    tempIndex++;
                    //cc.log(`第${tempIndex}个坐标是(${i},${j})`);
                    if (tempIndex == index) {
                        pos.x = i;
                        pos.y = j;
                        stop = true;
                        break;
                    }
                }
            }
            if (stop) {
                break;
            }
        }
        return pos;
    }

    public moveToChess(): void {
        if (this.canPlace && this.scanMaze[this.placePos.x][this.placePos.y] == EMPTY) {
            //这里编辑落子程序
            let index = this.mazeToArrayIndex(this.placePos);
            this.gameScene.addGridToScene(this.gameGrid.children[0], index);
            this.canPlace = false;
            this.scanMaze[this.placePos.x][this.placePos.y] = FULL;
            cc.log("落子成功！");
            //落子后激活方块生产区域
            let num: number = Math.floor(Math.random() * 1000) % 10 + 1;//随机款式测试
            this.gameScene.creatorGrid(num);
        } else {
            return;
        }
    }
}