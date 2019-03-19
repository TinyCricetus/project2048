import { IGameBoard } from "./IBoard";
import { Grid } from "./Grid";
import { WIDTH, HEIGHT, DISTANCE, CANNOTPLACE, CORRECTVALUE, EMPTY, SHALLOW, NORMAL, FULL } from "./GridData";
import { GameScene } from "./GameScene";


export class GameBoardImpl implements IGameBoard {
    
    public sourcePos: cc.Vec2 = null;//格子坐标原点(数组坐标)
    
    private maze: number[][] = [];//棋盘,位置-1表示没有位置，位置0表示背景(可放置方块)
    private realPos: cc.Vec2[][] = [];//用于储存背景格子真实坐标
    
    private placeA: cc.Vec2 = null;//目前正在操作的两个方块数组位置
    private placeB: cc.Vec2 = null;
    private centerToEdge: number = 0;//中心点距离边缘的格数
    private oneStepRow: number = 0;//走一格的长度,纵向和横向与方块的长宽有关
    private oneStepCol: number = 0;
    private halfStep: number = 0;//用于真实坐标偏移，造成六边形形状
    private shiftValue: number = 0;//用于数组坐标偏移，模仿六边形位置
    private canPlace: boolean = false;


    private gameScene: GameScene = null;
    private bgGridArray: cc.Node[] = null;

    public setMaze(pos: cc.Vec2, state: number): number {
        if (state == FULL && this.maze[pos.x][pos.y] == EMPTY) {
            this.maze[pos.x][pos.y] = state;
            return this.mazeToArray(pos);
        }
        if (state == EMPTY && this.maze[pos.x][pos.y] == FULL) {
            this.maze[pos.x][pos.y] = state;
            return this.mazeToArray(pos);
        }
        return -1;
    }

    public getMaze(pos: cc.Vec2): number {
        return this.maze[pos.x][pos.y];
    }

    public getRealPos(pos: cc.Vec2): cc.Vec2 {
        return this.realPos[pos.x][pos.y];
    }


    public ifMoveToBoard(pos: cc.Vec2): boolean {
        let ret: boolean = false;
        for (let i = 0; i < this.realPos.length; i++) {
            for (let j = 0; j < this.realPos[i].length; j++) {
                if (this.realPos[i][j] != null) {
                    ret = this.isContain(this.realPos[i][j], pos);
                    if (ret) {
                        return ret;
                    }
                }
            }
        }
        return ret;
    }

    public changeGridState(index: number[]): void {
        let length = index.length;
        if (length <= 0) {
            return;
        }
        if (length == 1) {
            for (let i = 0; i < this.bgGridArray.length; i++) {
                if (i == index[0]) {
                    this.bgGridArray[i].opacity = SHALLOW;
                } else {
                    this.bgGridArray[i].opacity = NORMAL;
                }
            }
        } else {
            for (let i = 0; i < this.bgGridArray.length; i++) {
                if (i == index[0] || i == index[1]) {
                    this.bgGridArray[i].opacity = SHALLOW;
                } else {
                    this.bgGridArray[i].opacity = NORMAL;
                }
            }
        }
    }

    public judgeSuperposition(controlPos: cc.Vec2): void {
        //cc.log(controlPos);
        // //正在操控方块的坐标信息,注意使用时应该注意转换
        // let tempPos = this.gameGrid.convertToWorldSpaceAR(this.gameGrid.children[0].position);
        // tempPos = this.gameScene.node.convertToNodeSpaceAR(tempPos);
        let index: number = -1;
        let signA: number = -1;
        let signB: number = -1;
        for (let i = 0; i < this.maze.length; i++) {
            for (let j = 0; j < this.maze[i].length; j++) {
                //扫描背景方块
                if (this.maze[i][j] != CANNOTPLACE) {
                    index++;
                    let judge: boolean = this.isContain(controlPos, this.realPos[i][j]);
                    if (judge) {
                        signA = index;
                        //注意，记录的是在数组中的位置
                        this.placeA = cc.v2(i, j);
                    }
                }
            }
        }
        //判定重合
        if (signA != -1 && this.judgeEmpty()) {
            if (this.gameScene.combineGridType == 1) {
                this.changeGridState([signA]);
                //cc.log("现在是在第:" + signA + "个格子");
            } else {
                signB = this.mazeToArray(this.placeB);
                this.changeGridState([signA, signB]);
            }
            this.canPlace = true;
        } else {
            this.changeGridState([-1]);
        }
    }

    public getAnotherGridPos(pos: cc.Vec2, type: number): cc.Vec2 {
        let aroundArray: cc.Vec2[] = this.getAroundGrid(pos);
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

    public getAroundGrid(temp: cc.Vec2): cc.Vec2[] {
        let pos: cc.Vec2 = this.changToShiftPos(temp);
        let aroundArray: cc.Vec2[] = [];
        aroundArray.push(cc.v2(pos.x + 1, pos.y - this.shiftValue));
        aroundArray.push(cc.v2(pos.x + 1, pos.y + this.shiftValue));
        aroundArray.push(cc.v2(pos.x, pos.y - 1));
        aroundArray.push(cc.v2(pos.x, pos.y + 1));
        aroundArray.push(cc.v2(pos.x - 1, pos.y - this.shiftValue));
        aroundArray.push(cc.v2(pos.x - 1, pos.y + this.shiftValue));
        for (let i = 0; i < aroundArray.length; i++) {
            aroundArray[i] = this.chaogeToStandardPos(aroundArray[i]);
        }
        return aroundArray;
    }

    public chaogeToStandardPos(pos: cc.Vec2): cc.Vec2 {
        return cc.v2(pos.x, pos.y - Math.abs(pos.x - this.sourcePos.x) * 0.5);
    }

    public changToShiftPos(pos: cc.Vec2): cc.Vec2 {
        return cc.v2(pos.x, pos.y + Math.abs(pos.x - this.sourcePos.x) * 0.5);
    }

    public fitPosition(node: cc.Node[], type: number): void {
        let posLeft: cc.Vec2 = null;
        let posRight: cc.Vec2 = null;
        if (type == 2) {
            //横型坐标
            posLeft = cc.v2(-(this.oneStepRow / 2), 0);
            posRight = cc.v2(this.oneStepRow / 2, 0);
        } else if (type == 3) {
            //左上至右下型坐标
            posLeft = cc.v2(-(WIDTH / 4), this.oneStepCol / 2);
            posRight = cc.v2((WIDTH / 4), -(this.oneStepCol / 2));
        } else if (type == 4) {
            //右上至左下型坐标
            posLeft = cc.v2(WIDTH / 4, this.oneStepCol / 2);
            posRight = cc.v2(-(WIDTH / 4), -(this.oneStepCol / 2));
        } else {
            cc.log("坐标匹配类型出错！");
            return;
        }
        node[0].position = posLeft;
        node[1].position = posRight;
        return;
    }

    /**
     * 用于初始化二维数组
     * @param array 要初始化的数组
     * @param length 初始化数组的长度
     * @param value 需要初始化的数值
     */
    public setArray(array: any[][], length: number, value: any): void {
        for (let i = 0; i <= length + 1; i++) {
            array[i] = [];
            for (let j = 0; j <= length + 1; j++) {
                array[i][j] = value;
            }
        }
    }

    public arrayToMaze(index: number): cc.Vec2 {
        let pos: cc.Vec2 = cc.v2();
        let tempIndex: number = -1;
        let stop: boolean = false;
        for (let i = 0; i < this.maze.length; i++) {
            for (let j = 0; j < this.maze[i].length; j++) {
                if (this.maze[i][j] != CANNOTPLACE) {
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


    public mazeToArray(pos: cc.Vec2): number {
        let index: number = -1;
        let stop = false;
        for (let i = 0; i < this.maze.length; i++) {
            for (let j = 0; j < this.maze[i].length; j++) {
                if (this.maze[i][j] != CANNOTPLACE) {
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

    public constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
        this.init(this.gameScene.centerToEdge);
    }

    /**
     * 
     * @param centerToEdge 棋盘中心点到边缘的格数
     */
    public init(centerToEdge: number) {
        this.centerToEdge = centerToEdge;
        this.bgGridArray = this.gameScene.bgGridArray;
        //计算棋盘长度
        let length: number = this.centerToEdge * 2 + 1;
        this.setArray(this.maze, length, CANNOTPLACE);
        this.setArray(this.realPos, length, null);

        this.sourcePos = cc.v2(this.centerToEdge + 1, this.centerToEdge + 1);

        //计算横竖间隔一格距离
        this.oneStepRow = WIDTH + DISTANCE;
        this.oneStepCol = HEIGHT + DISTANCE + CORRECTVALUE;

        this.halfStep = (WIDTH + DISTANCE) / 2;
        this.shiftValue = 0.5;
        this.canPlace = false;

        this.placeA = cc.v2();
        this.placeB = cc.v2();

        this.initControlArea(length);
        this.figureRealPosition(length);
    }

    public moveToChess(): void {
        if (this.gameScene.combineGridType == 1) {
            if (this.canPlace && this.getMaze(this.placeA) == EMPTY) {
                //这里编辑落子程序
                let index = this.mazeToArray(this.placeA);
                //注意这里的顺序，不能随意置换
                this.canPlace = false;
                this.setMaze(this.placeA, FULL);
                this.gameScene.addGridToScene(this.gameScene.gameGrid.children[0], index);
                //cc.log("落子成功！");
                //生成新方块
                //this.craetorGrid();
            }
        } else {
            if (this.canPlace && this.getMaze(this.placeA) == EMPTY &&
                this.getMaze(this.placeB) == EMPTY) {
                //这里编辑落子程序
                let indexA = this.mazeToArray(this.placeA);
                let indexB = this.mazeToArray(this.placeB);

                //注意这里的顺序，不能随意置换
                this.canPlace = false;
                this.setMaze(this.placeA, FULL);
                this.setMaze(this.placeB, FULL);
                let indexArray: number[] = [indexA, indexB];

                this.gameScene.addCombineGridToScene(this.gameScene.gameGrid.children, indexArray);
            }
        }
    }

    /**
     * 初始化棋盘可用范围
     * @param length 棋盘长度
     */
    private initControlArea(length: number) {
        let cnt: number = length - this.centerToEdge;
        for (let i = 1; i <= length; i++) {
            for (let j = 1; j <= cnt; j++) {
                this.maze[i][j] = EMPTY;
            }
            if (i <= this.centerToEdge) {
                cnt++;
            } else {
                cnt--;
            }
        }
    }

    /**
     * 计算棋盘背景方块的真实坐标
     * @param length 
     */
    private figureRealPosition(length: number) {
        //先初始化左侧第一列
        let x = WIDTH / 2;
        let y = HEIGHT / 2;
        //先设定第一列，用于对齐
        for (let i = 1; i < length + 1; i++) {
            this.realPos[i][1] = cc.v2(x, y + (i - 1) * this.oneStepCol);
        }

        //每列开头的距离倍数
        let distanceCnt: number = 1;
        for (let i = this.sourcePos.x - 1, j = this.sourcePos.x + 1; i > 0 &&
            j < this.sourcePos.x + this.centerToEdge + 1; i-- , j++) {
            this.realPos[i][1].x += distanceCnt * this.halfStep;
            this.realPos[j][1].x += distanceCnt * this.halfStep;
            distanceCnt++;
        }
        //按行计算
        let cnt = length - this.centerToEdge;//控制每行长度
        for (let i = 1; i < length + 1; i++) {
            for (let j = 2; j < cnt + 1; j++) {
                this.realPos[i][j] = cc.v2(this.realPos[i][j - 1].x + this.oneStepRow,
                    this.realPos[i][j - 1].y);
            }
            if (i < this.centerToEdge + 1) {
                cnt++;
            } else {
                cnt--;
            }
        }
        //使中心点对齐原点
        let spos: cc.Vec2 = cc.v2(this.realPos[this.sourcePos.x][this.sourcePos.y].x,
            this.realPos[this.sourcePos.x][this.sourcePos.y].y);
        for (let i = 1; i < length + 1; i++) {
            for (let j = 1; j < length + 1; j++) {
                if (this.realPos[i][j] != null) {
                    this.realPos[i][j].subSelf(spos);
                }
            }
        }
    }


    private judgeEmpty(): boolean {
        let type: number = this.gameScene.combineGridType;
        if (type == 1) {
            return this.getMaze(this.placeA) == EMPTY;
        } else {
            let aroundPos: cc.Vec2[] = this.getAroundGrid(this.placeA);
            //注意如果位置被旋转过，应该使用旋转后的位置
            if (this.gameScene.isSpin == 1) {
                switch (type) {
                    case 2:
                        this.placeB = aroundPos[2];
                        break;
                    case 3:
                        this.placeB = aroundPos[0];
                        break;
                    case 4:
                        this.placeB = aroundPos[1];
                        break;
                    default:
                        break;
                }
            } else {
                switch (type) {
                    case 2:
                        this.placeB = aroundPos[3];
                        break;
                    case 3:
                        this.placeB = aroundPos[5];
                        break;
                    case 4:
                        this.placeB = aroundPos[4];
                        break;
                    default:
                        break;
                }
            }

            return ((this.getMaze(this.placeA) == EMPTY) && (this.getMaze(this.placeB) == EMPTY));
        }
    }

    /**
     * 判断是否有重合，注意统一两个坐标的参考系
     * @param controlPos 
     * @param gridPos 
     */
    private isContain(posA: cc.Vec2, posB: cc.Vec2): boolean {
        if (this.gameScene.gameGrid.childrenCount <= 0) {
            return;
        }

        if ((Math.abs(posA.x - posB.x) < WIDTH / 2) &&
            (Math.abs(posA.y - posB.y) < HEIGHT / 2)) {
            return true;
        }
        return false;
    }

}
