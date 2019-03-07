import { CustomSkin } from "../Skin/CustomSkin";
import { GridPool } from "./GridPool";
import { ScoreTable } from "../Score/ScoreTable";
import { SkinDef } from "../Skin/SkinDef";

export class ShapeCreator {

    public exist: boolean = false;//形状产生区域是否已经存在形状
    public pool: GridPool = null;

    constructor(pool: GridPool) {
        this.pool = pool;
        this.exist = false;
    }

    /**
     * 创造新方块
     * @param skinStyle 结点初始化的皮肤款式(0-11,其中0为背景方块)
     */
    public creatorShape(skinStyle: number): cc.Node {
        //生产形状
        let tempNode: cc.Node = this.pool.getNode();
        //存储方块风格
        tempNode.getComponent("Grid").init(skinStyle);
        //配置皮肤
        CustomSkin.getSkin(tempNode, skinStyle);
        //配置方块皮肤匹配分数
        let tempChildNode: cc.Node = tempNode.children[0];
        tempChildNode.getComponent(cc.Label).string = ScoreTable.gridNumber[skinStyle];

        return tempNode;
    }

    /**
     * 创建联合方块数组
     * @param style 风格数组
     */
    public creatorCombineShape(style: number[]): cc.Node[] {
        let tempNode: cc.Node[] = [];

        for (let i = 0; i < style.length; i++) {
            tempNode[i] = this.pool.getNode();
            tempNode[i].getComponent("Grid").init(style[i]);
            CustomSkin.getSkin(tempNode[i], style[i]);
            let tempChildNode: cc.Node = tempNode[i].children[0];
            tempChildNode.getComponent(cc.Label).string = ScoreTable.gridNumber[style[i]];
        }

        return tempNode;
    }


}
