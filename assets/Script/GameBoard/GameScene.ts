import { Position } from "./Position";
import { Grid } from "./Grid";
import {ShapeCreator} from "./ShapeCreator";
import { GridPool } from "./GridPool";
import { GameControl } from "../GameControl";
import { GridControl } from "./GridControl";

const { ccclass, property } = cc._decorator;

/**
 * 游戏场景
 */
@ccclass
export class GameScene extends cc.Component {

    @property(cc.Prefab)
    gridPrefab: cc.Prefab = null;//方块预制体
    @property(cc.Integer)
    centerToEdge: number = 0;//控制棋盘大小
    @property(cc.Node)
    shapeCraetorPlace: cc.Node = null;//用于获取形状生成器的位置信息
    @property(cc.Node)
    gameGrid: cc.Node = null;//管理方块的结点

    public gridControl: GridControl = null;
    public shapeCeartor: ShapeCreator = null;//形状生成器
    public gameControl: GameControl = null;
    public nodePool: GridPool = null;
    public position: Position = null;
    public gridArray: Array<cc.Node> = new Array<cc.Node>();
    //public gridPosArray: Array<cc.Vec2> = new Array<cc.Vec2>();

    //一波加载猛如虎，一看时间两秒五
    public onLoad(): void {
        this.shapeCeartor = new ShapeCreator();
        this.nodePool = new GridPool();
        this.nodePool.initNodePool(this.gridPrefab);//初始化结点池
        //创建全局棋盘
        this.position = new Position();
        //如果开始没有给出格数，那就使用默认格数2
        this.position.positionInit(this.centerToEdge == 0 ? 2 : this.centerToEdge);
        //布置方块背景
        this.drawGrid();
        //创造一个方块
        this.creatorGrid();
        //生成逻辑控制
        this.gameControl = new GameControl(this);
        //生成方块控制
        this.gridControl = new GridControl(this);
    }

    //将坐标放入方块
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
                    this.gridAddToArray(pos[i][j]);
                    //this.gridPosArray.push(pos[i][j]);
                }
            }
        }

        for (let i = 0; i < this.gridArray.length; i++) {
            //cc.log(this.gridArray[i]);
            if (this.gridArray[i].position == this.position.sourcePos) {
                continue;
            }
            this.node.addChild(this.gridArray[i]);
        }
        cc.log("看一下背景方块数量:" + this.gridArray.length);
    }

    //生产区创造方块
    public creatorGrid(): void {
        let tempNode: cc.Node = null;
        tempNode = this.shapeCeartor.creatorShape(this.nodePool);
        tempNode.position = cc.v2(0, 0);
        this.gameGrid.addChild(tempNode);
    }
}
