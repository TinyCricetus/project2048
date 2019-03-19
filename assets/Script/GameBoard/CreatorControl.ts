import { GameScene } from "./GameScene";
import { GridControl } from "./GridControl";
import { WIDTH, HEIGHT, NORMAL, SHALLOW, EMPTY, CANNOTPLACE, FULL, NUMBER2048 } from "./GridData";
import { GameBoardImpl } from "./BoardImpl";

/**
 * 游戏全局逻辑控制
 */
export class CreatorControl {

    private gameScene: GameScene = null;
    private testIndex: number = 0;

    constructor(gameScene: GameScene) {
        this.gameScene = gameScene;
    }

    //从这里对出块逻辑进行调整
    public createGrid() {
            this.autoCreator();
            if (this.gameScene.auto.autoMode) {
                this.gameScene.helpWheel--;
                if (this.gameScene.helpWheel <= 0) {
                    this.gameScene.helpWheel = 0;
                    this.gameScene.auto.autoMode = false;
                }
            }
            this.gameScene.displayWheel();
    }

    //数据测试函数
    public testGridType(): number {
        let typeArray: number[] = [1, 1, 1, 1, 1, 1, 2, 3 ,4];
        this.testIndex++;
        return typeArray[this.testIndex];
    }

    public testGridNum(): cc.Vec2 {
        let gridNum: cc.Vec2[] = [
            cc.v2(11, 0),
            cc.v2(11, 0),
            cc.v2(11, 0),
            cc.v2(3, 0),
            cc.v2(5, 0),
            cc.v2(5, 0),
            cc.v2(1, 3),
            cc.v2(2, 2),
            cc.v2(2, 2),
        ];
        return gridNum[this.testIndex];
    }

    private randomCreator() {
        let type: number = Math.floor(Math.random() * 1000) % 4 + 1;
        let num1: number = Math.floor(Math.random() * 1000) % this.gameScene.theMaxStyle + 1;
        if (num1 >= NUMBER2048) {
            num1 -= 2;
        }
        let num2: number = Math.floor(Math.random() * 1000) % this.gameScene.theMaxStyle + 1;
        if (num2 >= NUMBER2048) {
            num2 -= 2;
        }

        if (type == 1) {
            //生成一型号方块
            this.gameScene.creatorGrid(num1);
        } else {
            this.gameScene.creatorCombineGrid([num1, num2], type);
        }
    }


    private autoCreator() {
        // //测试时启用
        // let type = this.testGridType();
        // let v: cc.Vec2 = this.testGridNum();
        // let num: cc.Vec2 = cc.v2(v.x, v.y);

        //这里插入自动产生逻辑
        this.gameScene.auto.figureEmpty();
        
        let length: number = this.gameScene.auto.typeNum.length;
        if (length == 0) {
            cc.log("无解决方案!");
            this.gameScene.gameOverFunc();
            return ;
        }
        let i: number = Math.floor(Math.random() * 1000) % length;
        let num: cc.Vec2 = this.gameScene.auto.gridNum[i];
        let type: number = this.gameScene.auto.typeNum[i];

        if (type == 1) {
            //生成一型号方块
            this.gameScene.creatorGrid(num.x);
        } else {
            this.gameScene.creatorCombineGrid([num.x, num.y], type);
        }
    }
}