
const {ccclass, property} = cc._decorator;

@ccclass
export class CircleAnimal extends cc.Component {
    
    @property
    duration: number = 0;
    
    //加载
    public onLoad (): void {
        this.cicleForever();
    }
        
    //永远转圈
    public cicleForever (): void {
        let seq = cc.sequence(cc.rotateBy(this.duration, 180), cc.rotateBy(this.duration, 180));
        let actionForever = cc.repeatForever(seq);
        this.node.runAction(actionForever);
    }   
}
