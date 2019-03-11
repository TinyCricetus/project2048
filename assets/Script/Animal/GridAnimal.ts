import { EMPTY, FULL, NUMBER2048 } from "../GameBoard/GridData";
import { GridPool } from "../GameBoard/GridPool";
import { Grid } from "../GameBoard/Grid";
import { GridAnimalControl } from "./GridAnimalControl";
import { GameScene } from "../GameBoard/GameScene";


export class GridAnimal {

    public scanMaze: number[][] = null;
    public canContinue: number = 0;

    public gridArray: cc.Node[] = null;
    public keyNode: cc.Node = null;
    public keyNodeStyle: number = 0;
    public nodeMazePos: cc.Vec2 = null;
    public pool: GridPool = null;
    public gridAnimalControl: GridAnimalControl = null;
    public keyNodeType: number = 0;
    public length: number = 0;

    constructor(gridAnimalContrtrol: GridAnimalControl) {
        this.gridAnimalControl = gridAnimalContrtrol;
    }

    public init(maze: number[][]) {
        this.scanMaze = maze;
    }

    /**
     * 开始执行消除动画
     * @param keyNode 关键结点，用于作为动画执行的集合点
     * @param gridArray 所有应该消失的结点
     */
    public startToDismiss(keyNode: cc.Node, pos: cc.Vec2, gridArray: Array<cc.Node>, pool: GridPool): void {
        this.canContinue = 0;
        this.gridArray = gridArray;
        this.keyNode = keyNode;
        this.keyNodeStyle = this.keyNode.getComponent("Grid").getStyle();
        this.nodeMazePos = pos;
        this.keyNodeType = this.keyNode.getComponent("Grid").gridType;
        this.pool = pool;
        let destination: cc.Vec2 = keyNode.position;
        this.length = gridArray.length;

        for (let i = 0; i < gridArray.length; i++) {
            gridArray[i].runAction(cc.sequence(cc.moveTo(0.5, destination).easing(cc.easeSineIn()),
                cc.callFunc(this.continueFlag, this)));
        }

        // let rootNode: cc.Node = this.keyNode.parent;
        // for (let i = 0; i < this.gridArray.length; i++) {
        //     rootNode.removeChild(this.gridArray[i]);
        //     this.pool.putNode(this.gridArray[i]);
        // }
    }

    public continueFlag() {
        this.canContinue++;
        if (this.canContinue == this.length) {
            //删除包括自身在内的参与合成的结点
            this.deleteNode();
            if (this.keyNodeStyle < NUMBER2048) {
                cc.log("当前为非2048爆炸情况,方块风格为" + this.keyNodeStyle);
                //加入合成结点
                this.gridAnimalControl.addLevelUpGridToScene(this.keyNodeStyle, this.nodeMazePos, this.keyNodeType, () => {
                    if (this.keyNodeType != 1) {
                        //用于回调结束时联合方块进行额外的操作
                        this.extra();
                    }
                });
            }

            // //恢复拖动
            // this.gridAnimalControl.gameScene.gridControl.canDrag = true;
        }
    }

    public deleteNode() {
        let rootNode: cc.Node = this.keyNode.parent;
        for (let i = 0; i < this.gridArray.length; i++) {
            rootNode.removeChild(this.gridArray[i]);
            this.pool.putNode(this.gridArray[i]);
        }
    }

    public extra() {
        this.gridAnimalControl.nextStep();
    }
}
