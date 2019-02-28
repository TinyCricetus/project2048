import { Position } from "./Position";
import { Pool } from "./GridNodePool";
import { Grid } from "./Grid";
import {ShapeCreator} from "./ShapeCreator";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {

    @property(cc.Prefab)
    gridPrefab: cc.Prefab = null;
    @property
    centerToEdge: number = 0;
    @property(cc.Node)
    shapeCraetorPlace: cc.Node = null;
    @property(cc.Node)
    gameGrid: cc.Node = null;
    shapeCeartor: ShapeCreator = new ShapeCreator();//形状生成机
    

    public position: Position = new Position();
    public gridArray: Array<cc.Node> = new Array<cc.Node>();

    public onLoad(): void {
        Pool.initNodePool(this.gridPrefab);//初始化结点池
        //如果开始没有给出格数，那就使用默认格数2
        this.position.positionInit(this.centerToEdge == 0 ? 2 : this.centerToEdge);

        this.drawGrid();
        //创造一个方块
        this.creatorGrid();
    }

    //将坐标放入方块
    public gridAddToArray(pos: cc.Vec2): void {
        let tempGrid: cc.Node = null;
        tempGrid = Pool.getNode(this.gridPrefab);
        tempGrid.position = pos;
        this.gridArray.push(tempGrid);
    }

    public drawGrid(): void {
        let pos: cc.Vec2[][] = this.position.realPos;
        for (let i = 0; i < pos.length; i++) {
            for (let j = 0; j < pos[i].length; j++) {
                if (pos[i][j] == null) {
                    continue;
                } else {
                    this.gridAddToArray(pos[i][j]);
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
    }

    //生产区创造方块
    public creatorGrid(): void {
        let tempNode: cc.Node = null;
        tempNode = this.shapeCeartor.creatorShape();
        tempNode.position = cc.v2(0, 0);
        this.gameGrid.addChild(tempNode);
    }
}
