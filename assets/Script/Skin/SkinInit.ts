import {SkinType} from "./SkinData";
import {skin_element_id} from "./skin_def";

const {ccclass, property} = cc._decorator;

@ccclass
export class SkinInit extends cc.Component {

    public static skin: SkinInit = new SkinInit();
    public totalSkin: number = 11;

    private skinArray: {[index: string]: string};

    public onLoad (): void {

    }



    private addSkinName (): void {
        let test: {[index: number]: string};
        var map = new Map<string, string>();
    }
}
