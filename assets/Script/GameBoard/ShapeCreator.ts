import {NodePool} from "./Pool";
import { Pool } from "./GridNodePool";
import {CustomSkin} from "../Skin/CustomSkin";

const {ccclass, property} = cc._decorator;

@ccclass
export class ShapeCreator extends cc.Component {

    @property(cc.Prefab)
    grid: cc.Prefab = null;

    public exist: boolean = false;//形状产生区域是否已经存在形状

    //初始化，开始的时候时没有方块的，这样的生产区域才会生成方块
    public onLoad(): void {
        this.exist = false;
    }

    public creatorShape (): cc.Node {
        if (this.exist) {
            return null;
        } else {
            //生产形状
            let tempNode: cc.Node = Pool.getNode(this.grid);
            //配置皮肤
            CustomSkin.getSkin(tempNode, 1);
            return tempNode;
        }
    }
}
