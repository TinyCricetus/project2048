import { EMPTY, FULL, NUMBER2048 } from "../GameBoard/GridData";
import { GridPool } from "../GameBoard/GridPool";
import { Grid } from "../GameBoard/Grid";
import { GridAnimalControl } from "./GridAnimalControl";
import { GameScene } from "../GameBoard/GameScene";


export class GridAnimal {
    private canContinue: number = 0;
    private gridArray: cc.Node[] = null;
    private keyNode: cc.Node = null;
    private keyNodeStyle: number = 0;
    private nodeMazePos: cc.Vec2 = null;
    private pool: GridPool = null;
    private gameScene: GameScene = null;
    private keyNodeType: number = 0;
    private length: number = 0;
    private animalControl: GridAnimalControl = null;

    constructor(animalControl: GridAnimalControl) {
        this.animalControl = animalControl;
        this.gameScene = this.animalControl.gameScene;
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

        let dir1: number = this.getRandomDir();
        let dir2: number = this.getRandomDir();
        //cc.moveTo(0.5, destination.sub(cc.v2(100 * dir1, 100 * dir2))).easing(cc.easeBackInOut()),
        for (let i = 0; i < gridArray.length; i++) {
            if (this.gameScene.auto.autoMode) {
                gridArray[i].runAction(cc.sequence(cc.moveTo(0.5, destination).easing(cc.easeBounceOut()),
                    cc.callFunc(this.continueFlag, this)));
            } else {
                gridArray[i].runAction(cc.sequence(cc.moveTo(0.5, destination).easing(cc.easeBackInOut()),
                    cc.callFunc(this.continueFlag, this)));
            }
        }
    }

    public continueFlag() {
        this.canContinue++;
        if (this.canContinue == this.length) {
            //删除包括自身在内的参与合成的结点
            this.deleteNode();
            if (this.keyNodeStyle < NUMBER2048) {
                //cc.log("当前为非2048爆炸情况,方块风格为" + this.keyNodeStyle);
                //加入合成结点
                this.animalControl.addLevelUpGridToScene(this.keyNodeStyle, this.nodeMazePos, this.keyNodeType, () => {
                    this.extra();
                });
            }
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
        this.animalControl.nextStep();
    }

    public getRandomDir(): number {
        let dir: number = Math.floor(Math.random() * 1000) % 2;
        if (dir == 0) {
            dir = -1;
        } else {
            dir = 1;
        }
        return dir;
    }
}
