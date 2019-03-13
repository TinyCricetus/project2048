import { GameScene } from "../GameBoard/GameScene";
import { GridAnimal } from "./GridAnimal";
import { EMPTY, FULL, NUMBER2048 } from "../GameBoard/GridData";
import { ScoreTable } from "../Score/ScoreTable";

export class GridAnimalControl {

    public gridAnimalArray: cc.Node[][] = null;
    public gameScene: GameScene = null;
    public scanMaze: number[][] = null;
    public gridDismissArray: cc.Node[] = null;
    public recordArray: cc.Vec2[] = null;
    public checkMaze: boolean[][] = null;
    public centerPoint: cc.Vec2 = null;
    public gridAnimal: GridAnimal = null;
    public dismissLimit: number = 0;
    public multipleRecord: number = 0;
    public addScore: number = 0;//当前消除增加的分数

    public shiftValue: number = 0.5;//设定数组偏移值

    public toolArray: cc.Vec2[][] = null;//工具数组,用于进行偏移,专门用于计算六边形的周围格子
    public dimissControl: number = 0;//用于控制1型和234型不同的消除扫描

    public combineGrid: cc.Node[] = null;
    public combinePos: cc.Vec2[] = null;
    public remian: number = 0;//记录一下联合方块是剩余小的还是大的

    public aroundGrid: cc.Vec2[] = null;

    //构造函数
    constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
        this.init();
    }

    //初始化函数
    public init() {
        this.scanMaze = this.gameScene.position.maze;
        this.centerPoint = this.gameScene.position.sourcePos;//数组的中心点
        //记录用的数组,用于临时记录最近的一次扫描相同的方块
        this.recordArray = [];
        //用于BFS遍历时标记遍历点
        this.checkMaze = [];
        this.gridAnimalArray = [];
        this.gridDismissArray = [];
        this.toolArray = [];
        this.initArray(this.scanMaze);
        //初始化动画特效
        this.gridAnimal = new GridAnimal(this);
        this.gridAnimal.init(this.scanMaze);
        this.dismissLimit = 2;
        this.aroundGrid = [];
    }

    //相关数组初始化
    public initArray(maze: number[][]) {
        for (let i = 0; i < maze.length; i++) {
            this.gridAnimalArray[i] = [];
            this.toolArray[i] = [];
            for (let j = 0; j < maze[i].length; j++) {
                let node: cc.Node = null;
                this.gridAnimalArray[i][j] = node;
                this.toolArray[i][j] = cc.v2(i, j + Math.abs(i - this.centerPoint.x) * this.shiftValue);
            }
        }
    }

    /**
     * 联合数组加入动画数组
     */
    public addCombineToAnimalArray(node: cc.Node[], pos: cc.Vec2[]) {
        // //动画启动时禁止拖动
        // this.gameScene.gridControl.canDrag = false;

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
            let result: boolean = this.judgeDismiss(node[0], pos[0]);
            if (result) {
                this.searchAndRecordAroundPos(pos[0]);
                this.dismissGrid(node[0], pos[0]);
            }
            //对结点0进行合成判断和处理,剩余结点1
            this.remian = 1;
            //获取剩余结点之后判断上个结点是否发生了消除操作，如果没有，对剩余结点进行消除检测
            if (!result) {
                //如果第一块没有产生消除，应该记录第二块的
                this.aroundGrid.push(pos[1]);
                this.nextStep();
            }
        } else {
            let result: boolean = this.judgeDismiss(node[1], pos[1]);
            if (result) {
                this.searchAndRecordAroundPos(pos[1]);
                this.dismissGrid(node[1], pos[1]);
            }
            this.remian = 0;
            if (!result) {
                this.aroundGrid.push(pos[0]);
                this.nextStep();
            }
        }

    }

    //记录玩家下棋点周围的棋子
    //从此函数增加对连续消除的限制
    public searchAndRecordAroundPos(pos: cc.Vec2) {
        //如果不是玩家下的，返回不记录
        // if (this.dismissLimit == 1) {
        //     return;
        // }
        this.aroundGrid = this.getAroundGrid(this.chaneToShiftPos(pos));
    }

    //第一轮动作结束之后回调函数调用的下一步
    public nextStep() {
        // let pos: cc.Vec2 = this.combinePos[this.remian];
        // let node: cc.Node = this.combineGrid[this.remian];
        // if (this.gridAnimalArray[pos.x][pos.y] != null) {
        //     if (this.judgeDismiss(node, pos)) {
        //         this.dismissGrid(node, pos);
        //     }
        // }
        if (this.aroundGrid.length > 0) {
            while (this.aroundGrid.length > 0) {
                let pos: cc.Vec2 = this.aroundGrid.shift();
                let node: cc.Node = this.gridAnimalArray[pos.x][pos.y];
                if (node != null && this.judgeDismiss(node, pos)) {
                    this.dismissGrid(node, pos);
                    break;
                }
            }
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

        //每一次加入结点，都应该扫描一次以确认是否产生消除,如果是234型，应该加入两次才扫描一次
        let gridType: number = node.getComponent("Grid").gridType;

        // //动画启动时禁止拖动
        // this.gameScene.gridControl.canDrag = false;

        //先检测一下这个是不是2048，如果是就直接炸掉!
        let tempType: number = node.getComponent("Grid").getStyle();
        if (tempType == NUMBER2048) {
            this.startToExplosion(node, pos);
        } else {
            if (this.judgeDismiss(node, pos)) {
                //如果这个单独型方块是玩家下的，记录周围棋子
                if (this.dismissLimit == 2) {
                    this.searchAndRecordAroundPos(pos);
                }
                this.dismissGrid(node, pos);
            } else {
                //当检测到不需要继续合并时，开始剩余操作
                
                //如果此方块是之前合成过来的，应该检测其周围方块
                if (this.dismissLimit == 1) {
                    this.searchAndRecordAroundPos(pos);
                }
                callback && callback();
            }
        }
    }

    /**
     * 判断是否满足消除条件
     * @param node 
     * @param pos 
     */
    public judgeDismiss(node: cc.Node, pos: cc.Vec2): boolean {
        let dimissCount = this.scanAnimalArray(pos);
        return dimissCount > this.dismissLimit;
    }

    public dismissGrid(node: cc.Node, pos: cc.Vec2) {
        //扫描一遍棋盘,判断消除条件

        cc.log("是时候一波消除了!");

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

    public updateScore() {
        //放置方块之后更新分数
        this.gameScene.score += this.addScore;
        this.gameScene.scoreDisplay.string = `${this.gameScene.score}`;
        cc.log(this.gameScene.scoreDisplay.string);
    }

    //在GridAnimal中运用,动画执行完毕之后增加方块
    public addLevelUpGridToScene(style: number, pos: cc.Vec2, type: number, callback: Function) {
        //清空消除方块的地图标记之后记得在地图加上合成方块
        // let style: number = node.getComponent("Grid").getStyle();
        this.gameScene.addAloneGridToScene(pos, style + 1, type, callback);
    }


    //2048爆炸
    public startToExplosion(node: cc.Node, pos: cc.Vec2) {
        this.initCheckStatus();//初始化状态点
        let aroundArray: cc.Vec2[] = this.getAroundGrid(this.chaneToShiftPos(pos));
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
    }

    /**
     * 利用坐标记录数组扫描全体落子点，将可消除方块加入消除数组
     */
    public addToDismissArray() {
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
    public clearPosition() {
        for (let i = 0; i < this.recordArray.length; i++) {
            let pos: cc.Vec2 = this.recordArray[i];
            this.scanMaze[pos.x][pos.y] = EMPTY;
            this.gridAnimalArray[pos.x][pos.y] = null;
        }
        //将棋盘定位阴影清空
        this.gameScene.gameControl.changeCombineGridState(-1);
    }

    //初始化标记数组
    public initCheckStatus() {
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
    public scanAnimalArray(pos: cc.Vec2): number {
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
            //开始向六个方向探索
            // for (let i: number = -1; i < 1 + 1; i++) {
            //     for (let j: number = -1; j < 1 + 1; j++) {
            //         let newPos = cc.v2(temp.x + i, temp.y + j);
            //         if (this.checkPos(newPos, pos, style)) {
            //             sameCount++;
            //             gridQueue.push(newPos);
            //             this.recordArray.push(cc.v2(newPos));
            //         } else {
            //             continue;
            //         }
            //     }
            // }
            let tempArray: cc.Vec2[] = this.getAroundGrid(this.toolArray[temp.x][temp.y]);
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
    public checkPos(newPos: cc.Vec2, oldPos: cc.Vec2, style: number): boolean {
        // //确认坐标是否在周围
        // if ( ((newPos.x == oldPos.x - 1) && (newPos.y == oldPos.y + 1))
        // || ((newPos.x == oldPos.x + 1) && (newPos.y == oldPos.y + 1)) ) {
        //     return false;
        // }
        //确认坐标是否在范围内
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

    public checkExplosionPos(pos: cc.Vec2) {
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


    /**
     * 用于返回传入节点的周围结点
     * @param pos 输入的中心位置(注意是偏移位置)
     */
    public getAroundGrid(pos: cc.Vec2): Array<cc.Vec2> {
        let aroundArray: cc.Vec2[] = [];
        aroundArray.push(cc.v2(pos.x + 1, pos.y - this.shiftValue));
        aroundArray.push(cc.v2(pos.x + 1, pos.y + this.shiftValue));
        aroundArray.push(cc.v2(pos.x, pos.y - 1));
        aroundArray.push(cc.v2(pos.x, pos.y + 1));
        aroundArray.push(cc.v2(pos.x - 1, pos.y - this.shiftValue));
        aroundArray.push(cc.v2(pos.x - 1, pos.y + this.shiftValue));
        for (let i = 0; i < aroundArray.length; i++) {
            aroundArray[i] = this.changeToStandardPos(aroundArray[i]);
        }
        return aroundArray;
    }

    //将带有偏移值的坐标转换为正常坐标
    public changeToStandardPos(pos: cc.Vec2): cc.Vec2 {
        return cc.v2(pos.x, pos.y - Math.abs(pos.x - this.centerPoint.x) * 0.5);
    }

    public chaneToShiftPos(pos: cc.Vec2): cc.Vec2 {
        return cc.v2(pos.x, pos.y + Math.abs(pos.x - this.centerPoint.x) * 0.5);
    }


    public figureOutScore(dismissLimit: number, nodeCount: number, gridNumber: number) {
        //如果是用户点击落子的话，消除限制是2， 如果是电脑合成落子的话，消除限制是1
        if (dismissLimit == 2) {
            this.multipleRecord = 1;
        } else {
            this.multipleRecord += 1;
        }
        this.addScore = ScoreTable.times[this.multipleRecord] * ScoreTable.multiple[nodeCount]
            * ScoreTable.basicScore[gridNumber];
    }
}
