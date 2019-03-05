import { GameScene } from "../GameBoard/GameScene";


export class GridAnimal {

    public gridAnimalArray: cc.Node[][] = null;
    public gameScene: GameScene = null;
    public scanMaze: number[][] = null;
    public gridDismissArray: cc.Node[] = null;
    public recordArray: cc.Vec2[] = null;
    public checkMaze: boolean[][] = null;
    public centerPoint: cc.Vec2 = null;

    public shiftValue: number = 0.5;//设定数组偏移值

    public toolArray: cc.Vec2[][] = null;//工具数组,用于进行偏移,专门用于计算六边形的周围格子

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
     * 加入动画数组
     * @param node 要加入的结点
     * @param pos 加入结点在二维数组中的位置
     */
    public addToAnimalArray(node: cc.Node, pos: cc.Vec2) {
        this.gridAnimalArray[pos.x][pos.y] = node;

        //每一次加入结点，都应该扫描一次以确认是否产生消除
        let dimissCount = this.scanAnimalArray(pos);
        if (dimissCount > 2) {
            cc.log("是时候一波消除了!");
        }
    }


    /**
     * 开始执行消除动画
     * @param keyNode 关键结点，用于动画执行的集合点
     * @param gridArray 所有应该消失的结点
     */
    public startToDismiss(keyNode: cc.Node, gridArray: Array<cc.Node>): void {

    }


    public initCheckMaze() {
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
        while (this.recordArray.length > 0) {
            this.recordArray.pop();
        }
        this.initCheckMaze();

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

    public changeToStandardPos(pos: cc.Vec2): cc.Vec2 {
        //将带有偏移值的坐标转换为正常坐标
        return cc.v2(pos.x, pos.y - Math.abs(pos.x - this.centerPoint.x) * 0.5);
    }
}
