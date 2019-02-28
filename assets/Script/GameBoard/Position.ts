import { Grid } from "./Grid";
import { CORRECTVALUE } from "./GridData";

/**
 * 用于建立游戏格局坐标,本游戏采用六边形坐标
 */
const { ccclass, property } = cc._decorator;

@ccclass
export class Position extends cc.Component {

    public grid: Grid = new Grid();//获取一个grid实例便于使用
    public centerToEdge: number = 0;//中心点距离边缘的格数
    public sourcePos: cc.Vec2 = null;//格子坐标原点
    public maze: number[][] = [];//棋盘
    public oneStepRow: number = 0;//走一格的长度,纵向和横向与方块的长宽有关
    public oneStepCol: number = 0;
    public realPos: cc.Vec2[][] = [];//用于储存真实坐标
    public halfStep: number = 0;//用于坐标偏移，造成六边形形状

    /**
     * 自定义坐标系初始化,注意只有获得数据棋盘才会初始化
     * @param centerToEdge 中心点距离边缘的格数
     */
    public positionInit(centerToEdge: number): void {

        this.centerToEdge = centerToEdge;
        this.init();//获得相关数据后，对棋盘进行初始化
    }

    public init(): void {
        //初始化整个棋盘
        let length = this.centerToEdge * 2 + 1;
        this.setMaze(this.maze, length, -1);
        this.setMaze(this.realPos, length, null);
        //计算中心点坐标
        this.sourcePos = cc.v2(this.centerToEdge + 1, this.centerToEdge + 1);
        //计算横竖间隔一格距离
        this.oneStepRow = this.grid.getWidth() + this.grid.getDistance();
        this.oneStepCol = this.grid.getHeight() + this.grid.getDistance() + CORRECTVALUE;
        this.halfStep = this.grid.getWidth() / 2 + this.grid.getDistance() / 2;
        //初始化可控范围(表示阴影六边形,即空位)
        let cnt = length - this.centerToEdge;//控制每行长度
        for (let i = 1; i < length + 1; i++) {
            for (let j = 1; j < cnt + 1; j++) {
                this.maze[i][j] = 0;
            }
            if (i < this.centerToEdge + 1) {
                cnt++;
            } else {
                cnt--;
            }
        }
        this.figureRealPosition(length);//初始化实际位置数据

    }

    //计算实际坐标
    public figureRealPosition(length: number): void {
        //先初始化左侧第一列
        let x = this.grid.getWidth() / 2;
        let y = this.grid.getHeight() / 2;
        //先设定第一列，用于对齐
        for (let i = 1; i < length + 1; i++) {
            this.realPos[i][1] = cc.v2(x, y + (i - 1) * this.oneStepCol);
        }

        //每列开头的距离倍数
        let distanceCnt: number = 1;
        for (let i = this.sourcePos.x - 1, j = this.sourcePos.x + 1; i > 0 && 
            j < this.sourcePos.x + this.centerToEdge + 1; i--, j++) {
                this.realPos[i][1].x += distanceCnt * this.halfStep;
                this.realPos[j][1].x += distanceCnt * this.halfStep;
                distanceCnt++;
        }
        //按行计算
        let cnt = length - this.centerToEdge;//控制每行长度
        for (let i = 1; i < length + 1; i++) {
            for (let j = 2; j < cnt + 1; j++) {
                this.realPos[i][j] = cc.v2(this.realPos[i][j - 1].x + this.oneStepRow,
                    this.realPos[i][j - 1].y);
            }
            if (i < this.centerToEdge + 1) {
                cnt++;
            } else {
                cnt--;
            }
        }
        //使中心点对齐原点
        let spos: cc.Vec2 = cc.v2(this.realPos[this.sourcePos.x][this.sourcePos.y].x, 
            this.realPos[this.sourcePos.x][this.sourcePos.y].y);
        for (let i = 1; i < length + 1; i++) {
            for (let j = 1; j < length + 1; j++) {
                if (this.realPos[i][j] != null) {
                    this.realPos[i][j].subSelf(spos);
                }
            }
        }
    }

    //用于对二维数组批量初始化操作
    public setMaze(maze: any[][], length: number, value: any): void {
        for (let i = 0; i < length + 1; i++) {
            maze[i] = [];
            for (let j = 0; j < length + 1; j++) {
                maze[i][j] = value;
            }
        }
    }

    // public searchMaze (maze: number[][], length: number): void {
    //     let cnt = length - this.centerToEdge;//控制每行长度
    //     for (let i = 1; i < length + 1; i++) {
    //         for (let j = 1; j < cnt + 1; j++) {
    //             //填写操作

    //         }
    //         if (i < this.centerToEdge + 1) {
    //             cnt++;
    //         } else {
    //             cnt--;
    //         }
    //     }
    // }

    public left(): void {

    }

    public right(): void {

    }

    public up(): void {

    }

    public down(): void {

    }
}
