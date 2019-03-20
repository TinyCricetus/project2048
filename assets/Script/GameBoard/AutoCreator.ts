import { GameScene } from "./GameScene";
import { EMPTY, CANNOTPLACE, FULL } from "./GridData";
import { BoardImpl } from "./BoardImpl";




/**
 * 此模块用于根据逻辑设计出块方案
 */

export class AutoCreator {

    public gameScene: GameScene = null;
    //用于获取目前棋盘各棋子数据
    public gridArray: cc.Node[][] = null;
    public autoMode: boolean = false;//智能匹配模式

    public typeNum: number[] = null;//用于记录具体方案的类型
    public gridNum: cc.Vec2[] = null;//用于记录具体方案的棋子数值，类型1的方块第二维默认为0

    private index: number = 0;
    private caseCount: number = 0;
    private emptyPos: cc.Vec2[] = null;
    private length: number = 0;
    private board: BoardImpl = null;

    private gridProbability: number[] = null;//四种方块的概率设定
    private gridType: number[] = null;

    public constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
        this.board = this.gameScene.board;
        this.init();
    }

    public init() {
        this.gridArray = this.gameScene.gridAnimalControl.gridAnimalArray;

        this.typeNum = [];
        this.gridNum = [];
        this.emptyPos = [];
        this.length = this.gameScene.length;

        this.gridProbability = [14, 16, 20, 50];
        this.gridType = [3, 4, 2, 1];
    }

    public clear() {
        while (this.typeNum.length > 0) {
            this.typeNum.shift();
        }
        while (this.gridNum.length > 0) {
            this.gridNum.shift();
        }
        while (this.emptyPos.length > 0) {
            this.emptyPos.shift();
        }
        this.index = 0;
        this.caseCount = 0;
    }

    public figureEmpty() {
        //清空之前的方案
        this.clear();
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.length; j++) {
                if (this.board.getMaze(cc.v2(i, j)) == EMPTY) {
                    this.emptyPos.push(cc.v2(i, j));
                }
            }
        }

        if (this.emptyPos.length == 0) {
            cc.log("游戏结束！");
            return ;
        }
        this.figureSolve();
    }


    private figureSolve() {
        let length: number = this.emptyPos.length;
        let i = Math.floor(Math.random() * 1000) % length;

        for (let j = -1; j <= 1; j++) {
            if (i + j < 0 || i + j >= length) {
                continue;
            }
            let temp: cc.Vec2 = this.emptyPos[i + j];
            //获取这个存在点周围的六个点
            let nodeArray: cc.Vec2[] = this.board.getAroundGrid(cc.v2(temp.x, temp.y));
            //开始进行方案判断
            this.judgeValue(nodeArray, cc.v2(temp.x, temp.y));
            if (this.caseCount >= 3) {
                return ;
            }
        }
    }

    private judgeValue(posArray: cc.Vec2[], center: cc.Vec2) {
        let emptyCount: number = 0;
        let emptyIndex: number[] = [];
        let fullIndex: number[] = [];
        let fullNode: cc.Node[] = [];
        for (let i = 0; i < posArray.length; i++) {
            if (this.board.getMaze(posArray[i]) == EMPTY) {
                emptyIndex.push(i);
            }
            if (this.board.getMaze(posArray[i]) == FULL) {
                fullNode.push(this.gridArray[posArray[i].x][posArray[i].y]);
                fullIndex.push(i);
            }
        }

        if (emptyIndex.length == 0) {
           
            if (!this.autoMode) {
                let type: number = Math.floor(Math.random() * 1000) % this.gameScene.theMaxStyle + 1;
                if (type >= 10) {
                    type -= 1;
                }
                this.addCase(cc.v2(type, 0), 1);
                return ;
            }

             //没有空位，表示只有中心点一个空位，那就返回旁边相同的风格
            if (fullNode.length > 0) {
                let type: number = fullNode[0].getComponent("Grid").getStyle();
                this.addCase(cc.v2(type, 0), 1);
            } else {
                cc.log("只有一个空位，周围却没有方块，这不科学！");
            }

            return;
        }

        if (fullNode.length <= 0) {
            //如果这个六边形全是空的，那就产生一个随机解决方案
            this.randomCase();

            return;
        }

        //判断智能出块是否启动
        let style: number = 0;
        if (this.autoMode) {
            style = fullNode[0].getComponent("Grid").getStyle();
            if (style >= 10) {
                style -= 1;
            }
        } else {
            style = Math.floor(Math.random() * 1000) % this.gameScene.theMaxStyle + 1;
            if (style >= 10) {
                style -= 2;
            }
            if (style <= 0) {
                style = style + Math.floor(Math.random() * 1000) % 3 + 1;
            }
        }
        
        
        if (emptyIndex.indexOf(1) != -1 || emptyIndex.indexOf(4) != -1) {
            //如果一号位和四号位是空的，那就采用3型方块
            this.emptyCase(style, 4);
        }

        if (emptyIndex.indexOf(2) != -1 || emptyIndex.indexOf(3) != -1) {
            //如果时2号位和3号位是空的，那就采用2型方块
            this.emptyCase(style, 2);
        }

        if (emptyIndex.indexOf(0) != -1 || emptyIndex.indexOf(5) != -1) {
            //如果时0号位和5号位是空的，那就采用4型方块
            this.emptyCase(style, 3);
        }
    }

    private emptyCase(style: number, type: number) {
        let style2: number = 0;
        if (this.autoMode) {
            style2 = style + this.getPositiveOrNagtive();
            if (style2 == 0) {
                style2++;
            }
            if (style2 >= 10) {
                style2 -= 1;
            }
        } else {
            style2 = Math.floor(Math.random() * 1000) % this.gameScene.theMaxStyle + 1;
            if (style2 >= 10) {
                style2 -= 2;
            }
            if (style2 <= 0) {
                style2 = style2 + Math.floor(Math.random() * 1000) % 3 + 1;
            }
        }
        this.addCase(cc.v2(style, style2), type);
    }

    //随机方案
    public randomCase() {
        // let numType: number = Math.floor(Math.random() * 1000) % 3;//随机类型
        let numType: number = this.getGridType();
        let num: number = Math.floor(Math.random() * 1000) % this.gameScene.theMaxStyle + 1;//随机款式
        if (num >= 9) {
            num -= numType;
        }
        let num2: number = Math.floor(Math.random() * 1000) % this.gameScene.theMaxStyle + 1;
        if (num2 >= 9) {
            num2 -= numType;
        }
        if (numType == 1) {
            this.addCase(cc.v2(num, 0), 1);
        } else {
            this.addCase(cc.v2(num, num2), numType);
        }
    }

    private getPositiveOrNagtive(): number {
        let num: number = Math.floor(Math.random() * 1000) % 3;
        if (num == 0) {
            return -1;
        } else if (num == 1) {
            return 0;
        } else {
            return 1;
        }
    }

    //增加解决方案
    private addCase(num: cc.Vec2, type: number) {
        this.caseCount++;
        this.gridNum.push(num);
        this.typeNum.push(type);
    }


    private getGridType(): number {
        let num: number = Math.random() * 100;
        for (let i = 0; i < this.gridProbability.length; i++) {
            if (this.gridProbability[i] >= num) {
                //cc.log(this.gridType[i]);
                return this.gridType[i];
            }
        }
        return this.gridType[this.gridType.length - 1];
    }

}
