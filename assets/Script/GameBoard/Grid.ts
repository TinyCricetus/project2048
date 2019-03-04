import { WIDTH, HEIGHT, DISTANCE } from "./GridData";


const {ccclass, property} = cc._decorator;

/**
 * 定义一个格子的大小
 */
@ccclass
export class Grid extends cc.Component {

    @property(cc.Integer)
    style: number = 0;//方块风格


    //格子的宽和高
    private width: number = WIDTH;
    private height: number = HEIGHT;
    private distance: number = DISTANCE;

    /**
     * 方块初始化
     * @param style 方块风格
     */
    public init(style: number): void {
        this.style = style;
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
