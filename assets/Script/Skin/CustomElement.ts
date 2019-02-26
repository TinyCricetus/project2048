import {skin_element_id} from "./skin_def";

const {ccclass, property} = cc._decorator;

@ccclass
export class CustomElement extends cc.Component {

    @property(cc.Integer)
    skinElementId: number = 0;

    //测试用变量
    // private num: number = 1;

    protected sprite: cc.Sprite = null;
    protected doingLoadingSkin: boolean = false;

    public onLoad (): void {
        this.sprite = this.node.getComponent(cc.Sprite);
    }

    public setSkinElementId (id: skin_element_id): void {
        if (this.skinElementId == id) {
            return ;
        } else {
            this.skinElementId = id;
        }
    }
}
