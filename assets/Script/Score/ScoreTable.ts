
export class ScoreTable {

    public static gridNumber: {[key: number]: string} = {
        1: "2",
        2: "4",
        3: "8",
        4: "16",
        5: "32",
        6: "64",
        7: "128",
        8: "256",
        9: "512",
        10: "1024",
        11: "2048",
    };


    public static basicScore: {[key: number]: number} = {
        1   : 16,
        2   : 32,
        3   : 64,
        4   : 128,
        5   : 256,
        6   : 512,
        7   : 1024,
        8   : 2048,
        9   : 4096,
        10  : 8192,
        11  : 16384,
    };

    public static multiple: {[key: number]: number} = {
        2   : 0.5,
        3   : 1,
        4   : 2,
        5   : 4,
        6   : 8,
        7   : 16,
        8   : 32,
    };


    public static times: {[key: number]: number} = {
        0   : 1,
        1   : 1,
        2   : 2,
        3   : 4,
        4   : 8,
        5   : 16,
        6   : 32,
    }
    
    //测试用例
    // public onLoad(): void {
    //     for (let key in ScoreTable.basicScore) {
    //         cc.log(ScoreTable.basicScore[key]);
    //     }
    // }
}
