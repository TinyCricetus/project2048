import { WIDTH, HEIGHT, DISTANCE } from "./GridData";


const {ccclass, property} = cc._decorator;

/**
 * 定义一个格子的大小
 */
@ccclass
export class Grid extends cc.Component {

    @property(cc.Integer)
    style: number = 0;//方块风格

    public gridType: number = 0;

    //格子的宽和高
    private width: number = WIDTH;
    private height: number = HEIGHT;
    private distance: number = DISTANCE;


    /**
     * 方块初始化
     * @param style 方块风格
     */
    public init(style: number, type: number): void {
        this.style = style;
        this.gridType = type;
        this.node.rotation = 0;
    }


    /**
     * //永远转圈
    public cicleForever (): void {
        let seq = cc.sequence(cc.rotateBy(this.duration, 180), cc.rotateBy(this.duration, 180));
        let actionForever = cc.repeatForever(seq);
        this.node.runAction(actionForever);
    }
     */

    public activeMajorKey() {
        let seq: cc.FiniteTimeAction = cc.sequence(cc.scaleTo(0.3, 0.8), cc.scaleTo(0.3, 1.2), cc.scaleTo(0.3, 1));
        let actForever = cc.repeatForever(seq);
        this.node.runAction(actForever);
    }

    public freezeMajorKey() {
        this.node.scale = 1;
        this.node.stopAllActions();
    }

    public setStyle(style: number): void {
        this.style = style;
    }

    public getStyle(): number {
        return this.style;
    }

    public getWidth (): number {
        return this.width;
    }

    public getHeight (): number {
        return this.height;
    }

    public getDistance (): number {
        return this.distance;
    }
}
