/**
 * 游戏棋盘接口
 */
export interface IGameBoard {

    /**
     * 各种型号的方块初始坐标计算
     * @param node 需要设定坐标的结点
     * @param type 需要设定的方块类型
     */
    fitPosition(node: cc.Node[], type: number): void;


    /**
     * 获取传入结点的周围结点
     * @param pos 中心点
     */
    getAroundGrid(pos: cc.Vec2): Array<cc.Vec2>;
    

    /**
     * 转换为标准位置(数组中的位置)
     * @param pos
     */
    chaogeToStandardPos(pos: cc.Vec2): cc.Vec2;


    /**
     * 转换为偏移位置
     */
    changToShiftPos(pos: cc.Vec2): cc.Vec2;

    /**
     * 一维数组位置转二维数组位置
     * @param index 
     */
    arrayToMaze(index: number): cc.Vec2;


    /**
     * 二维数组位置转一维数组位置
     * @param pos 
     */
    mazeToArray(pos: cc.Vec2): number;


    /**
     * 判断出重合的背景方块
     * @param pos 正在操控方块的坐标信息,注意使用时应该注意转换
     */
    judgeSuperposition(pos: cc.Vec2): void;



    /**
     * 改变方块的状态，注意传入的是方块的一维数组位置
     * @param index 
     */
    changeGridState(index: number[]): void;



    /**
     * 获取复合型方块的另一块方块的数组位置
     * @param pos 
     * @param type 
     */
    getAnotherGridPos(pos: cc.Vec2, type: number): cc.Vec2;



    /**
     * 判断当前坐标是否能落子
     * @param pos 
     */
    ifMoveToBoard(pos: cc.Vec2): boolean;


    /**
     * 设置方块状态，设置成功后将会返回所设置方块的一维数组位置
     * 否则返回-1
     * @param pos 
     * @param state 
     */
    setMaze(pos: cc.Vec2, state: number): number;


    /**
     * 获取指定位置的方块状态
     * @param pos 
     */
    getMaze(pos: cc.Vec2): void;
}       
