import MapSystem from '../map/index';
import { color2Rgb, gridColor } from '../map/helper';

const DOMSIZE = 150;

interface IPlayer {
    gridX: number;
    gridZ: number;
    rotate: number;
    color: string;
}

export default class MiniMap {
    private radius: number;
    private canvas: HTMLCanvasElement;
    private dynamicCanvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private dynamicCtx: CanvasRenderingContext2D;
    private grids: any[];

    private numScale: number = 1;

    constructor(canvasId: string, canvasDynamicId: string, radius: number, grids: any[]) {
        this.radius = radius;

        this.numScale = DOMSIZE / (radius * 2);

        this.canvas = this.initCanvas(canvasId, '10');
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        this.dynamicCanvas = this.initCanvas(canvasDynamicId, '11');
        this.dynamicCtx = this.dynamicCanvas.getContext('2d') as CanvasRenderingContext2D;

        this.grids = grids;

        this.drawBackground();
        this.drawGrids();
    }

    initCanvas(canvasId: string, zIndex: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const size = this.radius * 2;
        canvas.width= DOMSIZE;
        canvas.height = DOMSIZE;
        canvas.style.width = `${DOMSIZE}px`;
        canvas.style.height = `${DOMSIZE}px`;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.right = '0';
        canvas.style.zIndex = zIndex;
        // canvas.style.border = '1px solid #000';
        return canvas;
    }

    updatePlayers(players: IPlayer[]) {
        this.drawPlayers(players);
    }

    drawPlayers(players: IPlayer[]) {
        this.dynamicCtx.clearRect(0, 0, DOMSIZE, DOMSIZE);
        players.forEach((player) => {
            const { gridX = 0, gridZ = 0, rotate = 0, color = '#f00' } = player;
            const [x, z] = [gridX + this.radius, gridZ + this.radius];
            this.dynamicCtx.fillStyle = color;
            this.drawArrow(x + 0.5, z + 0.5, rotate);
        });
    }

    drawArrow(x: number, z: number, rotate: number) {
        this.dynamicCtx.beginPath();
    
        this.dynamicCtx.save();
        this.dynamicCtx.translate(x * this.numScale, z * this.numScale);
        const angle = -rotate * Math.PI / 180 + Math.PI / 2;
        this.dynamicCtx.rotate(angle);
     
        this.dynamicCtx.lineTo(0 * this.numScale, -1 * this.numScale);
        this.dynamicCtx.lineTo(2 * this.numScale, 0 * this.numScale);
        this.dynamicCtx.lineTo(0 * this.numScale, 1 * this.numScale);
        this.dynamicCtx.lineTo(0 * this.numScale, 0 * this.numScale);
        
        this.dynamicCtx.fill();
        this.dynamicCtx.restore();

        this.dynamicCtx.arc(x * this.numScale, z * this.numScale, 4, 0, Math.PI * 2);

        this.dynamicCtx.fill();
        this.dynamicCtx.closePath();
    }

    drawBackground() {
        this.ctx.beginPath();
        this.ctx.fillStyle = '#0ff';
        this.ctx.fillRect(0, 0, DOMSIZE, DOMSIZE);
        this.ctx.closePath();
    }

    drawGrids() {
        this.ctx.beginPath();
        this.grids.forEach((grid) => {
            const { id, type = 'ground' } = grid;
            const [gridX, gridZ] = MapSystem.key2GridXZ(id);
            const [x, z] = [gridX + this.radius, gridZ + this.radius];
            const rgb = color2Rgb(gridColor(type));
            this.ctx.fillStyle = rgb;
            this.ctx.fillRect(x * this.numScale, z * this.numScale, 1 * this.numScale, 1 * this.numScale);
        })
    }
}