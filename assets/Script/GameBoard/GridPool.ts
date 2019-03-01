
//初始化对象池的大小
const MAXN: number = 50;

export class GridPool {

    public gridPool: cc.NodePool = null;
    public prefab: cc.Prefab = null;

    //初始化结点池
    public initNodePool(pre: cc.Prefab): void {
        this.gridPool = new cc.NodePool();
        this.prefab = pre;
        for (let i = 0; i < MAXN; i++) {
            this.gridPool.put(cc.instantiate(this.prefab));
        }
    }
    //取结点
    public getNode(): cc.Node{
        let nd: cc.Node = null;
        if (this.gridPool.size() > 0) {
            nd = this.gridPool.get();
        } else {
            nd = cc.instantiate(this.prefab);
        }
        return nd;
    }
}
