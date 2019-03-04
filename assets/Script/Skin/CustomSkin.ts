import { SkinDef } from "./SkinDef";

const {ccclass, property} = cc._decorator;

@ccclass
export class CustomSkin extends cc.Component {

    /**
     * 配置皮肤
     * @param rtNode 需要配置皮肤的结点
     * @param i 采用第i套皮肤
     */
    public static getSkin(rtNode: cc.Node, i: number): void {
        cc.loader.loadRes(SkinDef.SkinStyle[i], cc.SpriteFrame, function(err, sf) {
            rtNode.getComponent(cc.Sprite).spriteFrame = sf;
        });
    }
    
}
