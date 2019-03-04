
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    public gridAnimalArray: Array<cc.Node> = null;

    /**
     * 开始执行消除动画
     * @param keyNode 关键结点，用于动画执行的集合点
     * @param gridArray 所有应该消失的结点
     */
    public startToDismiss(keyNode: cc.Node, gridArray: Array<cc.Node>): void {

    }
}
