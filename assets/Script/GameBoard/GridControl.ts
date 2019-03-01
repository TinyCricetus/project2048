import { GameScene } from "./GameScene";

/**
 * 用于控制方块
 */
export class GridControl {

    public initPosNode: cc.Node = null;
    public gameScene: GameScene = null;
    public gameGrid: cc.Node = null;

    public pos: cc.Vec2 = null;
    public actionFlag: boolean = true;

    private canDrag: boolean = false;//拖动
    private canRotate: boolean = false;//旋转

    constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
        this.init();
    }

    public init(): void {
        
        this.initPosNode = this.gameScene.shapeCraetorPlace;
        //初始化位置坐标
        this.gameGrid = this.gameScene.gameGrid;
        this.gameGrid.position = this.initPosNode.position;

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

    public touchedEnd(): void {
        if (this.canRotate && this.actionFlag) {
            this.actionFlag = false;
            this.gameGrid.runAction(cc.sequence(cc.rotateBy(1, 180), 
            cc.callFunc(this.judgeAction, this)) );
            cc.callFunc
            this.canRotate = false;
        }
        this.canDrag = false;
    }

    //用于动作回调，控制动作执行完毕后才可执行下一个动作
    public judgeAction(): void {
        this.actionFlag = true;
    }
}
