import { GameScene } from "../GameBoard/GameScene";
import { GridAnimal } from "./GridAnimal";
import { EMPTY, FULL, NUMBER2048 } from "../GameBoard/GridData";
import { ScoreTable } from "../Score/ScoreTable";
import { BoardImpl } from "../GameBoard/BoardImpl";

export class GridAnimalControl {

    public gridAnimalArray: cc.Node[][] = null;
    public gameScene: GameScene = null;
    //消除限制,三子消除定义为三，二连消除定义为二
    public dismissLimit: number = 0;

    private scanMaze: number[][] = null;
    private gridDismissArray: cc.Node[] = null;
    private recordArray: cc.Vec2[] = null;
    private checkMaze: boolean[][] = null;
    private centerPoint: cc.Vec2 = null;
    private gridAnimal: GridAnimal = null;
    private multipleRecord: number = 0;
    private addScore: number = 0;//当前消除增加的分数

    private shiftValue: number = 0.5;//设定数组偏移值

    private toolArray: cc.Vec2[][] = null;//工具数组,用于进行偏移,专门用于计算六边形的周围格子
    private dimissControl: number = 0;//用于控制1型和234型不同的消除扫描

    private combineGrid: cc.Node[] = null;
    private combinePos: cc.Vec2[] = null;
    private remian: number = 0;//记录一下联合方块是剩余小的还是大的

    private aroundGrid: cc.Vec2[] = null;//存储剩余应该检测的方块

    private board: BoardImpl = null;

    //构造函数
    public constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
        this.board = this.gameScene.board;
        this.init();
    }

    public init() {
        //记录用的数组,用于临时记录最近的一次扫描相同的方块
        this.recordArray = [];
        //用于BFS遍历时标记遍历点
        this.checkMaze = [];
        this.gridAnimalArray = [];
        this.gridDismissArray = [];
        this.toolArray = [];
        this.initArray(this.gameScene.length);
        this.gridAnimal = new GridAnimal(this);
        this.dismissLimit = 3;
        this.aroundGrid = [];
        this.centerPoint = this.board.sourcePos;
    }

    public getGridAnimalArray(pos: cc.Vec2): cc.Node {
        return this.gridAnimalArray[pos.x][pos.y];
    }

    //相关数组初始化
    public initArray(length: number) {
        for (let i = 0; i < length + 1; i++) {
            this.gridAnimalArray[i] = [];
            this.toolArray[i] = [];
            for (let j = 0; j < length + 1; j++) {
                let node: cc.Node = null;
                this.gridAnimalArray[i][j] = node;
                this.toolArray[i][j] = cc.v2(i, j);
            }
        }
    }

    /**
     * 联合数组加入动画数组
     */
    public addCombineToAnimalArray(node: cc.Node[], pos: cc.Vec2[]) {
        this.combineGrid = node;
        this.combinePos = pos;
        for (let i = 0; i < pos.length; i++) {
            if (this.gridAnimalArray[pos[i].x][pos[i].y] == null) {
                this.gridAnimalArray[pos[i].x][pos[i].y] = node[i];
            } else {
                cc.log("加入方块重复!");
            }
        }
        //先合成小的
        let style: number[] = [];
        for (let i of node) {
            style.push(i.getComponent("Grid").getStyle());
        }
        if (style[0] <= style[1]) {
            this.dealGrid(node[0], pos[0], pos[1]);
        } else {
            this.dealGrid(node[1], pos[1], pos[0]);
        }
    }

    private dealGrid(node: cc.Node, pos: cc.Vec2, anotherPos: cc.Vec2) {
        let result: boolean = this.judgeDismiss(node, pos);
        if (result) {
            this.searchAndRecordAroundPos(pos);
            this.dismissGrid(node, pos);
        }
        //获取剩余结点之后判断上个结点是否发生了消除操作，如果没有，对剩余结点进行消除检测
        if (!result) {
            //如果第一块没有产生消除，应该记录第二块的
            this.aroundGrid.push(anotherPos);
            this.nextStep();
        }
    }

    //动作结束之后回调函数调用的下一步
    public nextStep() {
        if (this.aroundGrid.length > 0) {
            while (this.aroundGrid.length > 0) {
                let pos: cc.Vec2 = this.aroundGrid.shift();
                let node: cc.Node = this.gridAnimalArray[pos.x][pos.y];
                if (node != null && this.judgeDismiss(node, pos)) {
                    this.dismissGrid(node, pos);
                    break;
                }
                if (this.aroundGrid.length == 0) {
                    this.startToCreate();
                }
            }
        } else {
            this.startToCreate();
        }
    }

    /**
     * 加入动画数组
     * @param node 要加入的结点
     * @param pos 加入结点在二维数组中的位置
     */
    public addToAnimalArray(node: cc.Node, pos: cc.Vec2, callback: Function) {
        if (this.gridAnimalArray[pos.x][pos.y] == null) {
            this.gridAnimalArray[pos.x][pos.y] = node;
        } else {
            cc.log("加入结点重复，重复坐标:" + pos);
        }

        //每一次加入结点，都应该扫描一次以确认是否产生消除
        let gridType: number = node.getComponent("Grid").gridType;

        //先检测一下这个是不是2048，如果是就直接炸掉!
        let tempType: number = node.getComponent("Grid").getStyle();
        if (tempType == NUMBER2048) {
            this.startToExplosion(node, pos);
        } else {
            if (this.judgeDismiss(node, pos)) {
                //如果这个单独型方块是玩家下的，记录周围棋子
                if (this.dismissLimit == 3) {
                    this.searchAndRecordAroundPos(pos);
                }
                this.dismissGrid(node, pos);
            } else {
                //当检测到不需要继续合并时，开始剩余操作
                //如果此方块是之前合成过来的，应该检测其周围方块
                if (this.dismissLimit == 2) {
                    this.searchAndRecordAroundPos(pos);
                }
                this.nextStep();
            }
        }
    }

    //在GridAnimal中运用,动画执行完毕之后增加方块
    public addLevelUpGridToScene(style: number, pos: cc.Vec2, type: number, callback: Function) {
        //清空消除方块的地图标记之后记得在地图加上合成方块
        this.gameScene.addAloneGridToScene(pos, style + 1, type, callback);
    }

    private startToCreate() {
        if (this.gameScene.gameGrid.childrenCount == 0) {
            this.gameScene.creatorControl.createGrid();
        }
    }

    /**
     * 记录玩家下棋点周围的棋子
     * 从此函数增加对连续消除的限制
     * @param pos 
     */
    private searchAndRecordAroundPos(pos: cc.Vec2) {
        let tempArray: cc.Vec2[] = this.board.getAroundGrid(pos);
        for (let i of tempArray) {
            this.aroundGrid.push(i);
        }
    }

    /**
     * 判断是否满足消除条件
     * @param node 
     * @param pos 
     */
    private judgeDismiss(node: cc.Node, pos: cc.Vec2): boolean {
        let dimissCount = this.scanAnimalArray(pos);
        if (dimissCount >= this.dismissLimit) {
            return true;
        } else {
            return false;
        }
    }


    private dismissGrid(node: cc.Node, pos: cc.Vec2) {
        //确认消除，开始消除有关操作
        this.addToDismissArray();
        this.figureOutScore(this.dismissLimit, this.gridDismissArray.length,
            node.getComponent("Grid").getStyle());
        //更新分数
        this.updateScore();
        this.gridAnimal.startToDismiss(node, pos, this.gridDismissArray,
            this.gameScene.nodePool);
        //清理坐标系标记
        this.clearPosition();
    }

    private updateScore() {
        //放置方块之后更新分数
        this.gameScene.score += this.addScore;
        this.gameScene.scoreDisplay.string = `${this.gameScene.score}`;
        cc.sys.localStorage.setItem("score", this.gameScene.score);
        cc.log(this.gameScene.scoreDisplay.string);
    }


    //2048爆炸
    private startToExplosion(node: cc.Node, pos: cc.Vec2) {
        this.initCheckStatus();//初始化状态点
        let aroundArray: cc.Vec2[] = this.board.getAroundGrid(pos);
        this.recordArray.push(pos);
        for (let i of aroundArray) {
            if (this.checkExplosionPos(i)) {
                this.recordArray.push(i);
            }
        }
        this.addToDismissArray();
        this.figureOutScore(this.dismissLimit, this.gridDismissArray.length,
            node.getComponent("Grid").getStyle());
        this.updateScore();
        this.gridAnimal.startToDismiss(node, pos, this.gridDismissArray, this.gameScene.nodePool);
        this.clearPosition();
        this.gameScene.creatorControl.createGrid();
    }

    /**
     * 利用坐标记录数组扫描全体落子点，将可消除方块加入消除数组
     */
    private addToDismissArray() {
        for (let i = 0; i < this.recordArray.length; i++) {
            let pos: cc.Vec2 = this.recordArray[i];
            if (this.gridAnimalArray[pos.x][pos.y] == null) {
                cc.log("警告，动画检测程序出错！");
            } else {
                this.gridDismissArray.push(this.gridAnimalArray[pos.x][pos.y]);
            }
        }
    }

    /**
     * 重置地图空位标记
     */
    private clearPosition() {
        for (let i = 0; i < this.recordArray.length; i++) {
            let pos: cc.Vec2 = this.recordArray[i];
            this.board.setMaze(pos, EMPTY);
            this.gridAnimalArray[pos.x][pos.y] = null;
        }
        //将棋盘定位阴影清空
        this.board.changeGridState([-1]);
    }

    //初始化标记数组
    private initCheckStatus() {
        while (this.recordArray.length > 0) {
            this.recordArray.pop();
        }
        while (this.gridDismissArray.length > 0) {
            this.gridDismissArray.pop();
        }

        for (let i = 0; i < this.gridAnimalArray.length; i++) {
            this.checkMaze[i] = [];
            for (let j = 0; j < this.gridAnimalArray[i].length; j++) {
                this.checkMaze[i][j] = false;
            }
        }
    }

    /**
     * BFS宽度优先,搜索周围相同的结点
     * @param pos 最新的落子点
     */
    private scanAnimalArray(pos: cc.Vec2): number {
        //初始化搜索状态
        this.initCheckStatus();

        let sameCount: number = 1;
        let gridQueue: cc.Vec2[] = [];
        let style = this.gridAnimalArray[pos.x][pos.y].getComponent("Grid").getStyle();

        gridQueue.push(cc.v2(pos));
        this.recordArray.push(cc.v2(pos));
        //将初始点标记为遍历过了
        this.checkMaze[pos.x][pos.y] = true;

        while (gridQueue.length > 0) {
            let temp: cc.Vec2 = gridQueue.shift();
            let tempArray: cc.Vec2[] = this.board.getAroundGrid(this.toolArray[temp.x][temp.y]);
            for (let i = 0; i < tempArray.length; i++) {
                if (this.checkPos(tempArray[i], temp, style)) {
                    sameCount++;
                    gridQueue.push(tempArray[i]);
                    this.recordArray.push(cc.v2(tempArray[i]));
                }
            }
        }
        return sameCount;
    }

    /**
     * 用于配合BFS判断当前坐标是否符合规则
     * @param newPos 当前点
     * @param oldPos 对比的坐标
     * @param style 应该具有的风格
     */
    private checkPos(newPos: cc.Vec2, oldPos: cc.Vec2, style: number): boolean {
        let length = (this.centerPoint.x - 1) * 2 + 1;
        if (newPos.x > length || newPos.y > length || newPos.x < 1 || newPos.y < 1) {
            return false;
        }
        //确认该点是否被遍历过了
        if (this.checkMaze[newPos.x][newPos.y]) {
            return false;
        } else {
            this.checkMaze[newPos.x][newPos.y] = true;
        }
        //确认坐标点是否存在节点对象
        if (this.gridAnimalArray[newPos.x][newPos.y] == null) {
            return false;
        }
        //确认类型是否相同
        let tempStyle = this.gridAnimalArray[newPos.x][newPos.y].getComponent("Grid").getStyle();
        if (tempStyle != style) {
            return false;
        }
        return true;
    }

    private checkExplosionPos(pos: cc.Vec2) {
        //确认坐标是否在范围内
        let length = (this.centerPoint.x - 1) * 2 + 1;
        if (pos.x > length || pos.y > length || pos.x < 1 || pos.y < 1) {
            return false;
        }
        //确认坐标点是否存在节点对象
        if (this.gridAnimalArray[pos.x][pos.y] == null) {
            return false;
        }
        return true;
    }

    private figureOutScore(dismissLimit: number, nodeCount: number, gridNum: number) {
        //如果是用户点击落子的话，消除限制是2， 如果是电脑合成落子的话，消除限制是1
        if (dismissLimit == 2) {
            this.multipleRecord = 1;
        } else {
            this.multipleRecord += 1;
        }
        this.addScore = ScoreTable.times[this.multipleRecord] * ScoreTable.multiple[nodeCount]
            * ScoreTable.basicScore[gridNum];
    }
}
