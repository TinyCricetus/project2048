import { GameScene } from "./GameScene";
import { WIDTH, HEIGHT } from "./GridData";
import { Grid } from "./Grid";
import { GameBoardImpl } from "./BoardImpl";

/**
 * 用于控制方块
 */
export class GridControl {

    private shapeCreatorNode: cc.Node = null;
    private gameScene: GameScene = null;
    private gameGrid: cc.Node = null;

    private pos: cc.Vec2 = null;
    private actionFlag: boolean = true;

    private canDrag: boolean = false;//拖动

    private canRotate: boolean = false;//旋转
    private gridRealPos: cc.Vec2[][] = null;
    private board: GameBoardImpl = null;

    public constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
        this.board = this.gameScene.board;
        this.init();
    }

    private init(): void {
        this.shapeCreatorNode = this.gameScene.shapeCraetor;
        //初始化位置坐标
        this.gameGrid = this.gameScene.gameGrid;
        this.gameGrid.position = this.shapeCreatorNode.position;

        //对游戏场景进行监听
        this.gameScene.node.on(cc.Node.EventType.TOUCH_START, this.touchedBegin.bind(this));
        this.gameScene.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchedMove.bind(this));
        this.gameScene.node.on(cc.Node.EventType.TOUCH_END, this.touchedEnd.bind(this));
    }


    private touchedBegin(event: cc.Event.EventTouch): void {
        if (this.gameGrid.childrenCount <= 0) {
            return ;
        }
        this.pos = event.getLocation();
        this.pos = this.shapeCreatorNode.convertToNodeSpace(this.pos);
        if ((this.pos.x > 0 && this.pos.x < this.shapeCreatorNode.width) &&
            this.pos.y > 0 && this.pos.y < this.shapeCreatorNode.height) {
            this.canRotate = true;
        }
    }

    private touchedMove(event: cc.Event.EventTouch): void {
        if (this.gameGrid.childrenCount <= 0) {
            return ;
        }
        let tempPos = this.gameGrid.convertToWorldSpaceAR(this.gameGrid.children[0].position);
        tempPos = this.gameScene.node.convertToNodeSpaceAR(tempPos);
        this.board.judgeSuperposition(tempPos);

        if (this.canRotate) {
            let temp: cc.Vec2 = this.shapeCreatorNode.convertToNodeSpace(event.getLocation());
            if (temp.x < 0 || temp.x > this.shapeCreatorNode.width ||
                temp.y < 0 || temp.y > this.shapeCreatorNode.height) {
                this.canDrag = true;
                this.canRotate = false;
            }
        } else {
            if (this.canDrag) {
                let pos: cc.Vec2 = event.getLocation();
                this.gameGrid.position = this.gameScene.node.convertToNodeSpaceAR(pos);
            }
        }
    }

    private touchedEnd(event: cc.Event.EventTouch): void {
        if (this.gameGrid.childrenCount <= 0) {
            return ;
        }
        if (this.canRotate && this.actionFlag) {
            this.actionFlag = false;
            if (this.gameScene.auto.autoMode) {
                this.gameGrid.runAction(cc.sequence(cc.rotateBy(0.5, 180).easing(cc.easeBounceOut()),
                    cc.callFunc(this.judgeAction, this)));
                //小数字跟着旋转
                for (let i of this.gameGrid.children) {
                    i.runAction(cc.rotateBy(0.5, 180).easing(cc.easeBounceIn()));
                }
            } else {
                this.gameGrid.runAction(cc.sequence(cc.rotateBy(0.5, 180).easing(cc.easeBackOut()),
                    cc.callFunc(this.judgeAction, this)));
                //小数字跟着旋转
                for (let i of this.gameGrid.children) {
                    i.runAction(cc.rotateBy(0.5, 180).easing(cc.easeBackOut()));
                }
            }
            //注意标记要让落子方块交换坐标
            this.gameScene.isSpin *= -1;
            this.canRotate = false;
        }
        this.canDrag = false;
        //松开后的操作
        this.onTouchEnd(event.getLocation());
    }

    //用于动作回调，控制动作执行完毕后才可执行下一个动作
    private judgeAction(): void {
        this.actionFlag = true;
    }



    private onTouchEnd(temp: cc.Vec2) {
        //一旦松开，控制器因该马上回到形状发生器位置
        this.gameGrid.position = this.shapeCreatorNode.position;
        //一旦松开，先判断坐标再执行落子操作
        let judge_1: boolean = false;
        let judge_2: boolean = false;
        let pos: cc.Vec2 = this.gameScene.node.convertToNodeSpaceAR(temp);
        if (this.gameScene.combineGridType == 1) {
            judge_1 = this.board.ifMoveToBoard(pos);
            judge_2 = true;
        } else {
            let pos_1: cc.Vec2 = pos.add(this.gameGrid.children[0].position);
            let pos_2: cc.Vec2 = pos.add(this.gameGrid.children[1].position);
            judge_1 = this.board.ifMoveToBoard(pos_1);
            judge_2 = this.board.ifMoveToBoard(pos_2);
        }
        if (judge_1 && judge_2) {
            this.board.moveToChess();
        }
    }
}
