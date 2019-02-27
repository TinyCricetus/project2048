import { Position } from "./Position";
import { GridNodePool } from "./GridNodePool";
import { Grid } from "./Grid";


const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    gridPrefab: cc.Prefab = null;
    @property
    centerToEdge: number = 0;

    public position: Position = new Position();
    public gridArray: Array<cc.Node> = new Array<cc.Node>();

    public onLoad(): void {
        GridNodePool.initNodePool(this.gridPrefab);//初始化结点池
        //如果开始没有给出格数，那就使用默认格数2
        this.position.positionInit(this.centerToEdge == 0 ? 2 : this.centerToEdge);

        this.drawGrid();
    }

    //将坐标放入方块
    public gridAddToArray(pos: cc.Vec2): void {
        let tempGrid: cc.Node = null;
        if (GridNodePool.GridPool.size() < 0) {
            GridNodePool.addNode(this.gridPrefab);
        }
        tempGrid = GridNodePool.GridPool.get();
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
                    this.gridAddToArray(pos[i][j].sub(
                        pos[this.position.sourcePos.x][this.position.sourcePos.y]));
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
}
