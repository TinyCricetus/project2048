import { GameScene } from "./GameScene";
import { WIDTH, HEIGHT } from "./GridData";

/**
 * 用于控制方块
 */
export class GridControl {

    public initPosNode: cc.Node = null;
    public gameScene: GameScene = null;
    public gameGrid: cc.Node = null;

    public pos: cc.Vec2 = null;
    public actionFlag: boolean = true;

    public canDrag: boolean = false;//拖动
    private canRotate: boolean = false;//旋转

    private gridRealPos: cc.Vec2[][] = null;

    constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
        this.init();
    }

    public init(): void {

        this.initPosNode = this.gameScene.shapeCraetor;
        //初始化位置坐标
        this.gameGrid = this.gameScene.gameGrid;
        this.gameGrid.position = this.initPosNode.position;

        //初始化背景方块真实坐标
        this.gridRealPos = this.gameScene.position.realPos;

        //对游戏场景进行监听
        this.gameScene.node.on(cc.Node.EventType.TOUCH_START, this.touchedBegin.bind(this));
        this.gameScene.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchedMove.bind(this));
        this.gameScene.node.on(cc.Node.EventType.TOUCH_END, this.touchedEnd.bind(this));
    }


    public touchedBegin(event: cc.Event.EventTouch): void {
        this.pos = event.getLocation();
        this.pos = this.initPosNode.convertToNodeSpace(this.pos);
        if ((this.pos.x > 0 && this.pos.x < this.initPosNode.width) &&
            this.pos.y > 0 && this.pos.y < this.initPosNode.height) {
            this.canRotate = true;
        }
    }

    public touchedMove(event: cc.Event.EventTouch): void {
        this.pos = event.getLocation();
        this.pos = this.initPosNode.convertToNodeSpace(this.pos);
        //执行位置判断
        this.gameScene.gameControl.judgePos();

        if (this.canRotate) {
            if (this.pos.x < 0 || this.pos.x > this.initPosNode.width ||
                this.pos.y < 0 || this.pos.y > this.initPosNode.height) {
                this.canDrag = true;
                this.canRotate = false;
            }
        } else {
            if (this.canDrag) {
                let pos: cc.Vec2 = event.getLocation();
                this.gameGrid.position = this.gameScene.node.convertToNodeSpaceAR(pos);
                //cc.log(this.node.position.x + "," + this.node.position.y);
            }
        }
    }

    public touchedEnd(event: cc.Event.EventTouch): void {
        if (this.canRotate && this.actionFlag) {
            this.actionFlag = false;
            this.gameGrid.runAction(cc.sequence(cc.rotateBy(1, 180),
                cc.callFunc(this.judgeAction, this)));
            //小数字跟着旋转
            for (let i of this.gameGrid.children) {
                i.runAction(cc.rotateBy(1, 180));
            }
            this.canRotate = false;
        }
        this.canDrag = false;
        //一旦松开，控制器因该马上回到形状发生器位置
        this.gameGrid.position = this.initPosNode.position;
        //this.gameGrid.rotation = 0;//旋转归位
        //一旦松开，先判断坐标再执行落子操作
        let judge_1: boolean = false;
        let judge_2: boolean = false;
        let pos: cc.Vec2 = this.gameScene.node.convertToNodeSpaceAR(event.getLocation());
        if (this.gameScene.combineGridType == 1) {
            judge_1 = this.judgeMoveToChess(pos);
            judge_2 = true;
        } else {
            let pos_1: cc.Vec2 = pos.add(this.gameGrid.children[0].position);
            let pos_2: cc.Vec2 = pos.add(this.gameGrid.children[1].position);
            judge_1 = this.judgeMoveToChess(pos_1);
            judge_2 = this.judgeMoveToChess(pos_2);

            cc.log(pos_1 + " " + pos_2);
        }
        if (this.gameScene.combineGridType < 1 || this.gameScene.combineGridType > 4) {
            cc.log("类型错误!");
        }
        if (judge_1 && judge_2) {
            this.gameScene.gameControl.moveToChess();
        }
    }

    //用于动作回调，控制动作执行完毕后才可执行下一个动作
    public judgeAction(): void {
        this.actionFlag = true;
    }

    public judgeMoveToChess(pos: cc.Vec2): boolean {
        let ret: boolean = false;
        for (let i = 0; i < this.gridRealPos.length; i++) {
            for (let j = 0; j < this.gridRealPos[i].length; j++) {
                if (this.gridRealPos[i][j] != null) {
                    ret = this.isContain(this.gridRealPos[i][j], pos);
                    //cc.log(ret);
                    if (ret) {
                        return ret;
                    }
                }
            }
        }
        return ret;
    }

    public isContain(pos: cc.Vec2, pos2: cc.Vec2): boolean {
        if ((Math.abs(pos.x - pos2.x) < WIDTH / 2) &&
            (Math.abs(pos.y - pos2.y) < HEIGHT / 2)) {
            return true;
        }
        return false;
    }
}
