import MiniMap from "./miniMap";

interface IUIProps {
    miniMap: string;
    miniMapDynamic: string;
    grids: any[]; // test
}

export default class UISystem {
    private miniMap: MiniMap;
    constructor(porps: IUIProps) {
        const { miniMap, miniMapDynamic, grids } = porps;

        this.miniMap = new MiniMap(miniMap, miniMapDynamic, 20, grids);
    }

    updateMiniMap(players: any[]) {
        this.miniMap.updatePlayers(players);
    }
}