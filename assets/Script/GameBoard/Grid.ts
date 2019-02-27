import { WIDTH, HEIGHT, DISTANCE } from "./GridData";

const {ccclass, property} = cc._decorator;

/**
 * 定义一个格子的大小
 */
@ccclass
export class Grid extends cc.Component {

    //格子的坐标(中心)
    @property(cc.Vec2)
    pos: cc.Vec2 = null;
    //格子的宽和高
    private width: number = WIDTH;
    private height: number = HEIGHT;
    private distance: number = DISTANCE;

    // constructor (p: cc.Vec2) {
    //     this.pos = p;
    // }
    
    public getPos (): cc.Vec2 {
        return this.pos;
    }

    public setPos (p: cc.Vec2): void {
        this.pos = p;
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


    //获取四个边缘的单个坐标
    public getTop (): number {
        return this.pos.y + (this.height / 2);
    }

    public getBottom (): number {
        return this.pos.y - (this.height / 2);
    }

    public getRight (): number {
        return this.pos.x + (this.width / 2);
    }

    public getLeft (): number {
        return this.pos.x - (this.width / 2);
    }
}
