import {CustomSkin} from "../Skin/CustomSkin";
import { GridPool } from "./GridPool";

export class ShapeCreator {

    private exist: boolean = false;//形状产生区域是否已经存在形状
    
    public getExist(): boolean {
        return this.exist;
    }
    public setExist(value: boolean) {
        this.exist = value;
    }

    //初始化，开始的时候时没有方块的，这样的生产区域才会生成方块
    public init(): void {
        this.exist = false;
    }

    public creatorShape (pool: GridPool): cc.Node {
        if (this.exist) {
            return null;
        } else {
            //生产形状
            let tempNode: cc.Node = pool.getNode();
            //配置皮肤
            CustomSkin.getSkin(tempNode, 1);
            return tempNode;
        }
    }
}
