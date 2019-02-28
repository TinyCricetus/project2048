
const {ccclass, property} = cc._decorator;

@ccclass
export class SkinDef extends cc.Component {

    //public static Skin: SkinDef = new SkinDef();

    /**
     * 注意这个时用于加载动态资源的时候调用的
     */
    public static SkinStyle: {[key: number]: string} = {
        0: "table_cell/cell_background",
        1: "table_cell/style_1",
        2: "table_cell/style_2",
        3: "table_cell/style_3",
        4: "table_cell/style_4",
        5: "table_cell/style_5",
        6: "table_cell/style_6",
        7: "table_cell/style_7",
        8: "table_cell/style_8",
        9: "table_cell/style_9",
        10: "table_cell/style_10",
        11: "table_cell/style_11",
    };
    
}
