
const { ccclass, property } = cc._decorator;

//初始化对象池的大小
const MAXN: number = 50;

@ccclass
export class GridNodePool extends cc.Component {

    public static GridPool: cc.NodePool = new cc.NodePool();
    //初始化结点池
    public static initNodePool(prefab: cc.Prefab): void {
        for (let i = 0; i < MAXN; i++) {
            GridNodePool.GridPool.put(cc.instantiate(prefab));
        }
    }
    //没有结点时用于增加
    public static addNode(prefab: cc.Prefab): void {
        GridNodePool.GridPool.put(cc.instantiate(prefab));
    }
}
