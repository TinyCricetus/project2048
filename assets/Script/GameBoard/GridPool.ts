
//初始化对象池的大小
const MAXN: number = 50;

export class GridPool {

    private static gridPoolInstance: GridPool = null;
    private gridPool: cc.NodePool = null;
    private prefab: cc.Prefab = null;

    public static getInstance(): GridPool {
        if (GridPool.gridPoolInstance == null) {
            GridPool.gridPoolInstance = new GridPool();
        }
        return GridPool.gridPoolInstance;
    }

    //初始化结点池
    public init(pre: cc.Prefab): void {
        this.gridPool = new cc.NodePool();
        this.prefab = pre;
        for (let i = 0; i < MAXN; i++) {
            this.gridPool.put(cc.instantiate(this.prefab));
        }
    }

    /**
     * 反初始化
     */
    public uninit(): void {
        GridPool.gridPoolInstance = null;
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

    //放结点
    public putNode(node: cc.Node): void {
        node.getComponent("Grid").freezeMajorKey();
        this.gridPool.put(node);
    }
}
