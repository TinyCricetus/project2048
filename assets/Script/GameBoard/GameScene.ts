import { Position } from "./Position";
import { Grid } from "./Grid";
import {ShapeCreator} from "./ShapeCreator";
import { GridPool } from "./GridPool";
import { GameControl } from "../GameControl";
import { GridControl } from "./GridControl";
import { GridAnimalControl } from "../Animal/GridAnimalControl";
import { FULL } from "./GridData";

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

    public gridControl: GridControl = null;
    public shapeCeartor: ShapeCreator = null;//形状生成器
    public gameControl: GameControl = null;
    public nodePool: GridPool = null;
    public position: Position = null;
    public gridArray: Array<cc.Node> = new Array<cc.Node>();
    public gridAnimalControl: GridAnimalControl = null;
    public gridAnimalArray: cc.Node[][] = null;
    public theMaxStyle: number = 1;

    //一波加载猛如虎，一看时间两秒五
    public onLoad(): void {
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
        //创造一个方块
        this.creatorGrid(1);
        //生成游戏主逻辑控制
        this.gameControl = new GameControl(this);
        //生成方块控制
        this.gridControl = new GridControl(this);
        
        //创建特效模块
        this.gridAnimalControl = new GridAnimalControl(this);
        //获取特效数组引用
        this.gridAnimalArray = this.gridAnimalControl.gridAnimalArray;
    }

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
        cc.log("看一下背景方块数量:" + this.gridArray.length);
    }

    /**
     * 创造方块并加入到方块产生区
     */
    public creatorGrid(style: number): void {
        let tempNode: cc.Node = null;
        tempNode = this.shapeCeartor.creatorShape(style);
        tempNode.position = cc.v2(0, 0);
        this.gameGrid.addChild(tempNode);
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
        //cc.log(style);
        node.parent.removeAllChildren();
        this.nodePool.putNode(node);
        this.addGrid(index, style);

        /*----------------------------用于单元测试--------------------------*/
        //this.unitTest();
    }

    /**
     * 此函数用于创建方块并加入主场景和动画数组
     * @param index 
     * @param style 
     */
    public addGrid(index: number, style: number) {
        let tempNode: cc.Node = this.shapeCeartor.creatorShape(style);
        this.node.addChild(tempNode);
        tempNode.position = this.gridArray[index].position;

        //加入动画组
        let pos: cc.Vec2 = this.gameControl.arrayIndexToMaze(index);
        this.gridAnimalControl.addToAnimalArray(tempNode, pos);
    }

    /**
     * 单独落子函数
     * @param pos 下落结点在棋盘中的数组位置
     * @param style 下落结点的风格
     */
    public addAloneGridToScene(pos: cc.Vec2, style: number) {
        //注意从合成落子的地方是消除限制是2
        this.gridAnimalControl.dismissLimit = 1;
        let index = this.gameControl.mazeToArrayIndex(pos);
        if (style >= 11) {
            cc.log("2048是可以爆炸的！");
            style = 11;
        }
        //记录一下已经存在的更大的数字
        this.theMaxStyle = this.theMaxStyle > style ? this.theMaxStyle : style;
        this.addGrid(index, style);
        this.position.maze[pos.x][pos.y] = FULL;
    }

    //用于单元测试的测试函数，勿动
    public unitTest(): cc.Vec2 {
        return this.gameControl.arrayIndexToMaze(12);
    }
}
