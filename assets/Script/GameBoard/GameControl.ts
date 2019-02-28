
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    initPosNode: cc.Node = null;
    @property(cc.Node)
    gameScene: cc.Node = null;

    public pos: cc.Vec2 = null;
    public actoin: cc.Action = null;

    private canDrag: boolean = false;
    private canRotate: boolean = false;


    public onLoad(): void {
        //初始化位置坐标
        this.node.position = this.initPosNode.position;
        //初始化旋转
        this.actoin = cc.rotateBy(1, 180);

        this.gameScene.on(cc.Node.EventType.TOUCH_START, this.touchedBegin.bind(this));
        this.gameScene.on(cc.Node.EventType.TOUCH_MOVE, this.touchedMove.bind(this));
        this.gameScene.on(cc.Node.EventType.TOUCH_END, this.touchedEnd.bind(this));
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
        if (this.canRotate) {
            if (this.pos.x < 0 || this.pos.x > this.initPosNode.width ||
                this.pos.y < 0 || this.pos.y > this.initPosNode.height) {
                this.canDrag = true;
                this.canRotate = false;
            }
        } else {
            if (this.canDrag) {
                let pos: cc.Vec2 = event.getLocation();
                this.node.position = this.gameScene.convertToNodeSpaceAR(pos);
                //cc.log(this.node.position.x + "," + this.node.position.y);
            }
        }

    }

    public touchedEnd(): void {
        if (this.canRotate) {
            this.node.runAction(this.actoin);
            this.canRotate = false;
        }
        this.canDrag = false;
    }
}
