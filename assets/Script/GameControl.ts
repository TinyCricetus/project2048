import { Position } from "./GameBoard/Position";
import { GameScene } from "./GameBoard/GameScene";
import { GridControl } from "./GameBoard/GridControl";
import { WIDTH, HEIGHT, NORMAL, SHALLOW, EMPTY, CANNOTPLACE, FULL, NUMBER2048 } from "./GameBoard/GridData";

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
    public placePos_2: cc.Vec2 = null;
    public testIndex: number = 0;

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
        this.placePos_2 = cc.v2();
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
        if (sign != -1 && this.judgeEmpty()) {
            if (this.gameScene.combineGridType == 1) {
                this.changeGridState(sign);
            } else {
                let sign_2: number = this.mazeToArrayIndex(this.placePos_2);
                this.changeCombineGridState([sign, sign_2]);
                //cc.log("应该变浅的是方格：" + sign + " " + sign_2);
            }
            this.canPlace = true;
        } else {
            this.changeGridState(-1);
        }
    }

    public judgeEmpty(): boolean {
        let type: number = this.gameScene.combineGridType;
        if (type == 1) {
            return this.scanMaze[this.placePos.x][this.placePos.y] == EMPTY;
        } else {
            return this.recordAndJudge(type);
        }
    }

    public recordAndJudge(type: number): boolean {
        
        let aroundPos: cc.Vec2[] = this.gameScene.gridAnimalControl.getAroundGrid(
            this.gameScene.gridAnimalControl.chaneToShiftPos(this.placePos));
            //注意如果位置被旋转过，应该使用旋转后的位置
        if (this.gameScene.isSpin == 1) {
            switch(type) {
                case 2:
                this.placePos_2 = aroundPos[2];
                break;

                case 3:
                this.placePos_2 = aroundPos[0];
                break;

                case 4:
                this.placePos_2 = aroundPos[1];
                break;

                default:
                break;
            }
        } else {
            switch(type) {
                case 2:
                this.placePos_2 = aroundPos[3];
                break;

                case 3:
                this.placePos_2 = aroundPos[5];
                break;

                case 4:
                this.placePos_2 = aroundPos[4];
                break;

                default:
                break;
            }
        }
        
        return ((this.scanMaze[this.placePos.x][this.placePos.y] == EMPTY)
                && (this.scanMaze[this.placePos_2.x][this.placePos_2.y] == EMPTY));
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

    public changeCombineGridState(index: number[]) {
        for (let i = 0; i < this.bgGridArray.length; i++) {
            if (i == index[0] || i == index[1]) {
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
        if (this.gameGrid.childrenCount <= 0) {
            return ;
        }
        //正在操控方块的坐标信息,注意使用时应该注意转换
        let tempPos = this.gameGrid.convertToWorldSpaceAR(this.gameGrid.children[0].position);
        tempPos = this.gameScene.node.convertToNodeSpaceAR(tempPos);
        //cc.log("正在操控的坐标为: + " + tempPos);
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
        if (this.gameScene.combineGridType == 1) {
            if (this.canPlace && this.scanMaze[this.placePos.x][this.placePos.y] == EMPTY) {
                //这里编辑落子程序
                let index = this.mazeToArrayIndex(this.placePos);
                //注意这里的顺序，不能随意置换
                this.canPlace = false;
                this.scanMaze[this.placePos.x][this.placePos.y] = FULL;
                this.gameScene.addGridToScene(this.gameGrid.children[0], index);
                //cc.log("落子成功！");
                //生成新方块
                //this.craetorGrid();
            }
        } else {
            if (this.canPlace && this.scanMaze[this.placePos.x][this.placePos.y] == EMPTY &&
                this.scanMaze[this.placePos_2.x][this.placePos_2.y] == EMPTY) {
                //这里编辑落子程序
                let index = this.mazeToArrayIndex(this.placePos);
                let index_2 = this.mazeToArrayIndex(this.placePos_2);

                //注意这里的顺序，不能随意置换
                this.canPlace = false;
                this.scanMaze[this.placePos.x][this.placePos.y] = FULL;
                this.scanMaze[this.placePos_2.x][this.placePos_2.y] = FULL;
                // //注意第一个子节点会被删除
                // this.gameScene.addGridToScene(this.gameGrid.children[0], index);
                // this.gameScene.addGridToScene(this.gameGrid.children[0], index_2);
                let indexArray: number[] = [index, index_2];

                // //如果旋转过，注意变换顺序
                // if (this.gameScene.isSpin == 1) {
                //     this.gameGrid.children.reverse();
                //     //indexArray.reverse();
                // }

                this.gameScene.addCombineGridToScene(this.gameGrid.children, indexArray);
                //cc.log("落子成功！");
                //this.craetorGrid();
            }
        }
    }

    //从这里对出块逻辑进行调整
    public craetorGrid() {


            this.autoCreator();

            if (this.gameScene.auto.autoMode) {
                this.gameScene.helpWheel--;
                if (this.gameScene.helpWheel <= 0) {
                    this.gameScene.helpWheel = 0;
                    this.gameScene.auto.autoMode = false;
                }
            }

            this.gameScene.displayWheel();
    }


    //数据测试函数
    public testGridType(): number {
        let typeArray: number[] = [1, 1, 1, 1, 1, 1, 2, 3 ,4];

        this.testIndex++;

        return typeArray[this.testIndex];
    }

    public testGridNum(): cc.Vec2 {
        let gridNum: cc.Vec2[] = [
            cc.v2(11, 0),
            cc.v2(11, 0),
            cc.v2(11, 0),
            cc.v2(3, 0),
            cc.v2(5, 0),
            cc.v2(5, 0),

            cc.v2(1, 3),
            cc.v2(2, 2),
            cc.v2(2, 2),
        ];
        return gridNum[this.testIndex];
    }

    public autoCreator() {
        // //测试时启用
        // let type = this.testGridType();
        // let v: cc.Vec2 = this.testGridNum();
        // let num: cc.Vec2 = cc.v2(v.x, v.y);

        //这里插入自动产生逻辑
        this.gameScene.auto.figureEmpty();
        
        let length: number = this.gameScene.auto.typeNum.length;
        if (length == 0) {
            cc.log("无解决方案!");
            this.gameScene.gameOverFunc();
            return ;
        }
        let i: number = Math.floor(Math.random() * 1000) % length;
        let num: cc.Vec2 = this.gameScene.auto.gridNum[i];
        let type: number = this.gameScene.auto.typeNum[i];

        if (type == 1) {
            //生成一型号方块
            this.gameScene.creatorGrid(num.x);
        } else {
            this.gameScene.creatorCombineGrid([num.x, num.y], type);
        }
    }

    public randomCreator() {
        let type: number = Math.floor(Math.random() * 1000) % 4 + 1;
        let num1: number = Math.floor(Math.random() * 1000) % this.gameScene.theMaxStyle + 1;
        if (num1 >= NUMBER2048) {
            num1 -= 2;
        }
        let num2: number = Math.floor(Math.random() * 1000) % this.gameScene.theMaxStyle + 1;
        if (num2 >= NUMBER2048) {
            num2 -= 2;
        }

        if (type == 1) {
            //生成一型号方块
            this.gameScene.creatorGrid(num1);
        } else {
            this.gameScene.creatorCombineGrid([num1, num2], type);
        }
    }

    /**
     * 给与234型第一块方块，返回第二块方块的数组位置
     * @param pos 
     * @param type 
     */
    public getAnotherGrid(pos: cc.Vec2, type: number): cc.Vec2 {
        let temp: cc.Vec2 = this.gameScene.gridAnimalControl.chaneToShiftPos(pos);
        let aroundArray: cc.Vec2[] = this.gameScene.gridAnimalControl.getAroundGrid(temp);
        switch (type) {
            case 2:
                return aroundArray[3];
                break;

            case 3:
                return aroundArray[5];
                break;

            case 4:
                return aroundArray[4];
                break;

            default:
                break;
        }
    }
}