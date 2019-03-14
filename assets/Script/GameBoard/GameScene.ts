import { Position } from "./Position";
import { Grid } from "./Grid";
import {ShapeCreator} from "./ShapeCreator";
import { GridPool } from "./GridPool";
import { GameControl } from "../GameControl";
import { GridControl } from "./GridControl";
import { GridAnimalControl } from "../Animal/GridAnimalControl";
import { FULL } from "./GridData";
import { AutoCreator } from "./autoCreator";

const { ccclass, property } = cc._decorator;

/**
 * 游戏场景
 */
@ccclass
export class GameScene extends cc.Component {

    @property(cc.Prefab)
    gridPrefab: cc.Prefab = null;//方块预制体
    @property(cc.Integer)
    centerToEdge: number = 0;//控制棋盘大小，中心点到边缘的方块数
    @property(cc.Node)
    shapeCraetor: cc.Node = null;//用于获取形状生成器的位置信息
    @property(cc.Node)
    gameGrid: cc.Node = null;//管理方块的结点
    @property(cc.Label)
    scoreDisplay: cc.Label = null;//用于控制分数显示
    @property(cc.Node)
    gameOver: cc.Node = null;
    @property(cc.Button)
    wheel: cc.Button = null;
    @property(cc.Node)
    bg: cc.Node = null;

    public gridControl: GridControl = null;
    public shapeCeartor: ShapeCreator = null;//形状生成器
    public gameControl: GameControl = null;
    public nodePool: GridPool = null;
    public position: Position = null;
    public gridArray: Array<cc.Node> = new Array<cc.Node>();
    public gridAnimalControl: GridAnimalControl = null;
    public gridAnimalArray: cc.Node[][] = null;
    public theMaxStyle: number = 1;
    public score: number = 0;
    public isCombineGrid: boolean = null;
    public combineGridType: number = 0;
    public isSpin: number = -1;//联合方块是否旋转过，1代表旋转过，-1代表没有旋转过
    public auto: AutoCreator = null;
    public helpWheel: number = 0;

    //一波加载猛如虎，一看时间两秒五
    public onLoad(): void {

        //加载本地分数储存
        let localScore: number = Number(cc.sys.localStorage.getItem("score"));
        if (localScore == 0) {
            cc.sys.localStorage.setItem("score", 0);
        } else {
            
            this.score = localScore;
            this.score = Math.floor(this.score / 2);
        }

        //初始化方块节点池
        this.nodePool = new GridPool();
        this.nodePool.initNodePool(this.gridPrefab);//初始化结点池
        //创建形状生成器
        this.shapeCeartor = new ShapeCreator(this.nodePool);
        //创建全局棋盘
        this.position = new Position();
        //如果开始没有给出格数，那就使用默认格数2
        this.position.positionInit(this.centerToEdge == 0 ? 2 : this.centerToEdge);
        //布置方块背景
        this.drawGrid();
        //初始化，第一个方块不给联合类型
        this.isCombineGrid = false;
        //初始化第一个方块类型为1型
        this.combineGridType = 1;

        //创造一个方块
        this.creatorGrid(1);
        
        
        // //创造一个联合方块
        // let style: number[] = [1, 2];
        // this.creatorCombineGrid(style, 3);

        //生成游戏主逻辑控制
        this.gameControl = new GameControl(this);
        //生成方块控制
        this.gridControl = new GridControl(this);
        
        //创建特效模块
        this.gridAnimalControl = new GridAnimalControl(this);
        //获取特效数组引用
        this.gridAnimalArray = this.gridAnimalControl.gridAnimalArray;

        //开始启用逻辑方块生成控制
        this.auto = new AutoCreator(this);
        
        //分数归零！
        //this.score = 0;
        this.scoreDisplay.string = `${this.score}`;
        this.helpWheel = 30;//辅助轮协议初始化

        this.displayWheel();
    }

    // /**
    //  * 每帧刷新应该执行的操作
    //  * @param dt 每帧刷新的时间间隔
    //  */
    // public update(dt) {
        
    // }

    public gridAddToArray(pos: cc.Vec2): void {
        let tempGrid: cc.Node = null;
        tempGrid = this.nodePool.getNode();
        tempGrid.position = pos;
        //将方块放入方块数组
        this.gridArray.push(tempGrid);
    }

    //将方块渲染上画板
    public drawGrid(): void {
        let pos: cc.Vec2[][] = this.position.realPos;
        for (let i = 0; i < pos.length; i++) {
            for (let j = 0; j < pos[i].length; j++) {
                if (pos[i][j] == null) {
                    continue;
                } else {
                    //将坐标赋值给方块坐标
                    this.gridAddToArray(pos[i][j]);
                }
            }
        }
        //加入结点
        for (let i = 0; i < this.gridArray.length; i++) {
            //cc.log(this.gridArray[i]);
            if (this.gridArray[i].position == this.position.sourcePos) {
                continue;
            }
            this.node.addChild(this.gridArray[i]);
        }
        //cc.log("看一下背景方块数量:" + this.gridArray.length);
    }

    /**
     * 创造方块并加入到方块产生区
     */
    public creatorGrid(style: number): void {
        //设置为非联合类型
        this.isCombineGrid = false;
        this.combineGridType = 1;
        let tempNode: cc.Node = null;
        tempNode = this.shapeCeartor.creatorShape(style, 1);
        tempNode.position = cc.v2(0, 0);
        tempNode.rotation = this.gameGrid.rotation;
        this.gameGrid.addChild(tempNode);
    }

    /**
     * 创造联合方块并加入到生产区
     * @param style 
     * @param type 
     */
    public creatorCombineGrid(style: number[], type: number) {
        //设置为联合类型
        this.isCombineGrid = true;
        this.combineGridType = type;
        let tempNode: cc.Node[] = [];
        tempNode = this.shapeCeartor.creatorCombineShape(style, type);
        switch(type) {
            case 2:
            this.position.fitPosition(tempNode, 2);
            break;

            case 3:
            this.position.fitPosition(tempNode, 3);
            break;

            case 4:
            this.position.fitPosition(tempNode, 4);
            break;

            default:break;
        }
        for (let i = 0; i < tempNode.length; i++) {
            tempNode[i].rotation = this.gameGrid.rotation;
            this.gameGrid.addChild(tempNode[i]);
        }
    }


    /**
     * 加入联合方块
     */
    public addCombineGridToScene(node: cc.Node[], index: number[]) {
        this.gridAnimalControl.dismissLimit = 2;

        let style: number[] = [];
        let type: number = 0;
        for (let i of node) {
            style.push(i.getComponent("Grid").getStyle());
            type = i.getComponent("Grid").gridType;
        }

        let rootNode: cc.Node = node[0].parent;
        let length: number = rootNode.childrenCount;
        for (let i = 0; i < length; i++) {
            let tempNode: cc.Node = rootNode.children[0];
            rootNode.removeChild(tempNode);
            this.nodePool.putNode(tempNode);
        }
        this.addCombineGrid(index, style, type);
    }

    /**
     * 联合方块落子函数
     * @param index 
     * @param style 
     * @param type 
     */
    public addCombineGrid(index: number[], style: number[], type: number) {
        // let tempNode: cc.Node = this.shapeCeartor.creatorShape(style, type);
        // this.node.addChild(tempNode);
        // tempNode.position = this.gridArray[index].position;

        // //加入动画组
        // let pos: cc.Vec2 = this.gameControl.arrayIndexToMaze(index);
        // this.gridAnimalControl.addToAnimalArray(tempNode, pos);

        let tempNode: cc.Node[] = this.shapeCeartor.creatorCombineShape(style, type);
        for (let i of tempNode) {
            this.node.addChild(i);
        }
        
        let pos: cc.Vec2[] = [];
        for (let i of index) {
            pos.push(this.gameControl.arrayIndexToMaze(i));
        }

        for (let i = 0; i < tempNode.length; i++) {
            tempNode[i].position = this.gridArray[index[i]].position;
        }   

        //加入动画组
        this.gridAnimalControl.addCombineToAnimalArray(tempNode, pos);
    }



    /**
     * 联系控制棋盘的主场景落子函数
     * @param node 落子的对象
     * @param pos 在方块数组中的位置
     */
    public addGridToScene(node: cc.Node, index: number): void {
        //注意从关联落子的地方是消除限制是3
        this.gridAnimalControl.dismissLimit = 2;
        //node.position = this.gridArray[index].position;
        let style = node.getComponent("Grid").getStyle();
        let type = node.getComponent("Grid").gridType;
        //cc.log(style);
        node.parent.removeChild(node);
        this.nodePool.putNode(node);
        this.addGrid(index, style, type, null);

        /*----------------------------用于单元测试--------------------------*/
        //this.unitTest();
    }

    /**
     * 此函数用于创建方块并加入主场景和动画数组
     * @param index 
     * @param style 
     */
    public addGrid(index: number, style: number, type: number, callback: Function) {
        let tempNode: cc.Node = this.shapeCeartor.creatorShape(style, type);
        this.node.addChild(tempNode);
        tempNode.position = this.gridArray[index].position;

        //加入动画组
        let pos: cc.Vec2 = this.gameControl.arrayIndexToMaze(index);
        this.gridAnimalControl.addToAnimalArray(tempNode, pos, callback);
    }

    /**
     * 单独落子函数
     * @param pos 下落结点在棋盘中的数组位置
     * @param style 下落结点的风格
     */
    public addAloneGridToScene(pos: cc.Vec2, style: number, type, callback: Function) {
        //注意从合成落子的地方是消除限制是2
        this.gridAnimalControl.dismissLimit = 1;
        let index = this.gameControl.mazeToArrayIndex(pos);
        if (style >= 11) {
            cc.log("2048启动爆炸！");
            style = 11;
            //使用次数加2
            this.helpWheel += 5;
        }
        //记录一下已经存在的更大的数字
        this.theMaxStyle = this.theMaxStyle > style ? this.theMaxStyle : style;
        this.position.maze[pos.x][pos.y] = FULL;
        this.addGrid(index, style, type, callback);
    }

    //用于单元测试的测试函数，勿动
    public unitTest(): cc.Vec2 {
        return this.gameControl.arrayIndexToMaze(12);
    }

    public gameOverFunc() {
        this.gameOver.active = true;
        cc.sys.localStorage.setItem("score", 0);
        this.gameOver.children[0].getComponent(cc.Label).string = `${this.score}`;
    }


    public startHelp() {
        if (this.auto.autoMode) {
            this.auto.autoMode = false;
            this.wheel.node.children[0].getComponent(cc.Label).string = "辅助轮协议关闭中";
            this.changeTheBg(false);
            cc.log(this.wheel.node.children[0].getComponent(cc.Label).string);
            return ;
        }

        if (this.helpWheel > 0) {
            this.auto.autoMode = true;
            this.wheel.node.children[0].getComponent(cc.Label).string = "辅助轮协议启动中";
            this.changeTheBg(true);
            return ;
        }
    }

    public displayWheel() {
        this.wheel.node.children[1].getComponent(cc.Label).string = "协议剩余次数:" + this.helpWheel;
        if (this.helpWheel <= 0) {
            this.auto.autoMode = false;
            this.wheel.node.children[0].getComponent(cc.Label).string = "辅助轮协议关闭中";
            this.changeTheBg(false);
        }
    }

    public changeTheBg(exchange: boolean) {
        let self = this;
        if (exchange) {
            cc.loader.loadRes("bg/background2", cc.SpriteFrame, function(err, sf) {
                self.bg.getComponent(cc.Sprite).spriteFrame = sf;
            });
        } else {
            cc.loader.loadRes("bg/background", cc.SpriteFrame, function(err, sf) {
                self.bg.getComponent(cc.Sprite).spriteFrame = sf;
            });
        }
    }
}
