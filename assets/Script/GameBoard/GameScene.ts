import { Grid } from "./Grid";
import {ShapeCreator} from "./ShapeCreator";
import { GridPool } from "./GridPool";
import { CreatorControl } from "./CreatorControl";
import { GridControl } from "./GridControl";
import { GridAnimalControl } from "../Animal/GridAnimalControl";
import { FULL } from "./GridData";
import { AutoCreator } from "./autoCreator";
import { BoardImpl } from "./BoardImpl";
import { GridAnimal } from "../Animal/GridAnimal";

const { ccclass, property } = cc._decorator;

/**
 * 游戏场景
 */
@ccclass
export class GameScene extends cc.Component {

    @property(cc.Prefab)
    gridPrefab: cc.Prefab = null;//方块预制体
    @property(cc.Integer)
    centerToEdge: number = 0;//控制棋盘大小，中心点到边缘的方块数
    @property(cc.Node)
    shapeCraetor: cc.Node = null;//用于获取形状生成器的位置信息
    @property(cc.Node)
    gameGrid: cc.Node = null;//管理方块的结点
    @property(cc.Label)
    scoreDisplay: cc.Label = null;//用于控制分数显示
    @property(cc.Node)
    gameOver: cc.Node = null;
    @property(cc.Button)
    wheel: cc.Button = null;
    @property(cc.Node)
    bg: cc.Node = null;

    
    public creatorControl: CreatorControl = null;
    public nodePool: GridPool = null;
    public bgGridArray: Array<cc.Node> = new Array<cc.Node>();
    public gridAnimalControl: GridAnimalControl = null;
    public theMaxStyle: number = 1;
    public score: number = 0;
    public combineGridType: number = 0;
    public isSpin: number = -1;//联合方块是否旋转过，1代表旋转过，-1代表没有旋转过
    public auto: AutoCreator = null;
    public helpWheel: number = 0;
    public length: number = 0;
    public board: BoardImpl = null;

    private gridControl: GridControl = null;
    private shapeCeartor: ShapeCreator = null;//形状生成器

    //一波加载猛如虎，一看时间两秒五
    public onLoad(): void {

        //设定棋盘扫面区域，例如区域1-7，扫描区域设置为0-8
        this.length = this.centerToEdge * 2 + 2;

        //加载本地分数储存
        let localScore: number = Number(cc.sys.localStorage.getItem("score"));
        if (localScore == 0) {
            cc.sys.localStorage.setItem("score", 0);
        } else {
            this.score = localScore;
            this.score = Math.floor(this.score / 2);
        }

        //初始化方块节点池
        this.nodePool = GridPool.getInstance();
        this.nodePool.init(this.gridPrefab);//初始化结点池
        //创建形状生成器
        this.shapeCeartor = new ShapeCreator(this.nodePool);

        //创建棋盘控制器
        this.board = new BoardImpl(this);

        //布置方块背景
        this.drawGrid();
        //初始化第一个方块类型为1型
        this.combineGridType = 1;

        //创造一个方块
        this.creatorGrid(1);
        // //创造一个联合方块
        // let style: number[] = [1, 2];
        // this.creatorCombineGrid(style, 3);
        
        //生成游戏方块生成控制
        this.creatorControl = new CreatorControl(this);
        //生成方块控制
        this.gridControl = new GridControl(this);
        //生成特效模块
        this.gridAnimalControl = new GridAnimalControl(this);
        //启用方块生成控制
        this.auto = new AutoCreator(this);
        
        //分数归零！
        //this.score = 0;
        this.scoreDisplay.string = `${this.score}`;
        this.helpWheel = 30;//辅助轮协议初始化

        this.displayWheel();
    }

    /**
     * 创造方块并加入到方块产生区
     */
    public creatorGrid(style: number): void {
        this.combineGridType = 1;
        let tempNode: cc.Node = null;
        tempNode = this.shapeCeartor.creatorShape(style, 1);
        tempNode.position = cc.v2(0, 0);
        tempNode.rotation = this.gameGrid.rotation;
        this.gameGrid.addChild(tempNode);
    }

    /**
     * 创造联合方块并加入到生产区
     * @param style 
     * @param type 
     */
    public creatorCombineGrid(style: number[], type: number) {
        this.combineGridType = type;
        let tempNode: cc.Node[] = [];
        tempNode = this.shapeCeartor.creatorCombineShape(style, type);
        switch(type) {
            case 2:
            this.board.fitPosition(tempNode, 2);
            break;

            case 3:
            this.board.fitPosition(tempNode, 3);
            break;

            case 4:
            this.board.fitPosition(tempNode, 4);
            break;

            default:break;
        }

        //设定主键
        if (style[0] == style[1]) {
            tempNode[0].getComponent("Grid").activeMajorKey();
        }
        
        for (let i = 0; i < tempNode.length; i++) {
            tempNode[i].rotation = this.gameGrid.rotation;
            this.gameGrid.addChild(tempNode[i]);
        }
    }


    /**
     * 加入联合方块
     */
    public addCombineGridToScene(node: cc.Node[], index: number[]) {
        this.gridAnimalControl.dismissLimit = 3;

        let style: number[] = [];
        let type: number = 0;
        for (let i of node) {
            style.push(i.getComponent("Grid").getStyle());
            type = i.getComponent("Grid").gridType;
        }

        let rootNode: cc.Node = node[0].parent;
        let length: number = rootNode.childrenCount;
        for (let i = 0; i < length; i++) {
            let tempNode: cc.Node = rootNode.children[0];
            rootNode.removeChild(tempNode);
            this.nodePool.putNode(tempNode);
        }
        this.addCombineGrid(index, style, type);
    }

    /**
     * 联合方块落子函数
     * @param index 
     * @param style 
     * @param type 
     */
    public addCombineGrid(index: number[], style: number[], type: number) {

        let tempNode: cc.Node[] = this.shapeCeartor.creatorCombineShape(style, type);
        for (let i of tempNode) {
            this.node.addChild(i);
        }
        
        let pos: cc.Vec2[] = [];
        for (let i of index) {
            pos.push(this.board.arrayToMaze(i));
        }

        for (let i = 0; i < tempNode.length; i++) {
            tempNode[i].position = this.bgGridArray[index[i]].position;
        }   

        //加入动画组
        this.gridAnimalControl.addCombineToAnimalArray(tempNode, pos);
    }

    /**
     * 联系控制棋盘的主场景落子函数
     * @param node 落子的对象
     * @param pos 在方块数组中的位置
     */
    public addGridToScene(node: cc.Node, index: number): void {
        //注意从关联落子的地方是消除限制是3
        this.gridAnimalControl.dismissLimit = 3;
        //node.position = this.gridArray[index].position;
        let style = node.getComponent("Grid").getStyle();
        let type = node.getComponent("Grid").gridType;
        //cc.log(style);
        node.parent.removeChild(node);
        this.nodePool.putNode(node);
        this.addGrid(index, style, type, null);

        /*----------------------------用于单元测试--------------------------*/
        //this.unitTest();
    }

    private gridAddToArray(pos: cc.Vec2): void {
        let tempGrid: cc.Node = null;
        tempGrid = this.nodePool.getNode();
        tempGrid.position = pos;
        //将方块放入方块数组
        this.bgGridArray.push(tempGrid);
    }

    //将方块渲染上画板
    private drawGrid(): void {
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.length; j++) {
                if (this.board.getRealPos(cc.v2(i, j)) == null) {
                    continue;
                } else {
                    //将坐标赋值给方块坐标
                    this.gridAddToArray(this.board.getRealPos(cc.v2(i, j)));
                }
            }
        }
        //加入结点
        for (let i = 0; i < this.bgGridArray.length; i++) {
            //cc.log(this.gridArray[i]);
            if (this.bgGridArray[i].position == this.board.sourcePos) {
                continue;
            }
            this.node.addChild(this.bgGridArray[i]);
        }
    }

    /**
     * 此函数用于创建方块并加入主场景和动画数组
     * @param index 
     * @param style 
     */
    private addGrid(index: number, style: number, type: number, callback: Function) {
        let tempNode: cc.Node = this.shapeCeartor.creatorShape(style, type);
        this.node.addChild(tempNode);
        tempNode.position = this.bgGridArray[index].position;

        //加入动画组
        let pos: cc.Vec2 = this.board.arrayToMaze(index);
        this.gridAnimalControl.addToAnimalArray(tempNode, pos, callback);
    }

    /**
     * 单独落子函数
     * @param pos 下落结点在棋盘中的数组位置
     * @param style 下落结点的风格
     */
    public addAloneGridToScene(pos: cc.Vec2, style: number, type, callback: Function) {
        //注意从合成落子的地方是消除限制是2
        this.gridAnimalControl.dismissLimit = 2;
        let index = this.board.mazeToArray(pos);
        if (style >= 11) {
            cc.log("2048启动爆炸！");
            style = 11;
            //使用次数加5
            this.helpWheel += 5;
        }
        //记录一下已经存在的更大的数字
        this.theMaxStyle = this.theMaxStyle > style ? this.theMaxStyle : style;
        this.board.setMaze(pos, FULL);
        this.addGrid(index, style, type, callback);
    }

    //用于单元测试的测试函数，勿动
    public unitTest(): cc.Vec2 {
        return this.board.arrayToMaze(12);
    }

    public gameOverFunc() {
        this.gameOver.active = true;
        cc.sys.localStorage.setItem("score", 0);
        this.gameOver.children[0].getComponent(cc.Label).string = `${this.score}`;
    }

    public startHelp() {
        if (this.auto.autoMode) {
            this.auto.autoMode = false;
            this.wheel.node.children[0].getComponent(cc.Label).string = "辅助轮协议关闭中";
            this.changeTheBg(false);
            cc.log(this.wheel.node.children[0].getComponent(cc.Label).string);
            return ;
        }

        if (this.helpWheel > 0) {
            this.auto.autoMode = true;
            this.wheel.node.children[0].getComponent(cc.Label).string = "辅助轮协议启动中";
            this.changeTheBg(true);
            return ;
        }
    }

    public displayWheel() {
        this.wheel.node.children[1].getComponent(cc.Label).string = "协议剩余次数:" + this.helpWheel;
        if (this.helpWheel <= 0) {
            this.auto.autoMode = false;
            this.wheel.node.children[0].getComponent(cc.Label).string = "辅助轮协议关闭中";
            this.changeTheBg(false);
        }
    }

    public changeTheBg(exchange: boolean) {
        let self = this;
        if (exchange) {
            cc.loader.loadRes("bg/background2", cc.SpriteFrame, function(err, sf) {
                self.bg.getComponent(cc.Sprite).spriteFrame = sf;
            });
        } else {
            cc.loader.loadRes("bg/background", cc.SpriteFrame, function(err, sf) {
                self.bg.getComponent(cc.Sprite).spriteFrame = sf;
            });
        }
    }
}
