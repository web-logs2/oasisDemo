import React, { useEffect, useState } from 'react';

type RectType = 'grass' | 'sand' | 'ground' | 'rock' | 'forbid';
interface IRect {
    id: string;
    type: RectType;
}


function defaultData(size: number) {
    const rects: any[] = [];
    for(let i = -size/2; i < size/2;i++) {
        for(let j = -size/2; j < size/2;j++) {
            rects.push({
                id: `${i}.${j}`
            })
        }
    }
    return rects;
}

let type = 'grass'
const size = 36;
const halfSize = size / 2;
const rectSize = 200 / size;
const padding = 1;
const rects = defaultData(size);

export default () => {
    const [rectType, setRectType] =  useState(type);

    function outputData() {
        const outData = rects.filter(rect => rect.type && rect.type !== 'ground');
        console.log(JSON.stringify(outData));
    }

    function setType(index: number) {
        const rect = rects[index];
        if(rect) {
            rect.type = type;
        }
    }

    useEffect(() => {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const coverCanvas = document.getElementById('coverCanvas') as HTMLCanvasElement;
        const canvasSize = 200;
        const canvasStyleSize = 400;
        const canvasScale = canvasStyleSize / canvasSize;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        coverCanvas.width = canvasSize;
        coverCanvas.height = canvasSize;
       
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const coverCtx = coverCanvas.getContext('2d') as CanvasRenderingContext2D;

        draw();

        // 在用户操作之后、更新数据以及重绘画布
        function select(bounds: number[]) {
            const [startDataX, startDataY, endDataX, endDataY] = bounds;
            const minDataX = Math.min(startDataX, endDataX);
            const maxDataX = Math.max(startDataX, endDataX);
            const minDataY = Math.min(startDataY, endDataY);
            const maxDataY = Math.max(startDataY, endDataY);
            for(let i = minDataX; i <= maxDataX; i++) {
                for(let j = minDataY; j <= maxDataY; j++) {
                    const index = i * (size) + j;
                    setType(index);
                }
            }
            draw();
        }

        // 事件监听 - 触发机制
        canvas.onmousedown = (e) => {
            const { offsetX: startOffsetX, offsetY: startOffsetY } = e;
            const [startDataX, startDataY] = xy2DataXY(e.offsetX, e.offsetY);
            canvas.onmousemove = (e) => {
                const { offsetX: endOffsetX, offsetY: endOffsetY } = e;
                drawCover([startOffsetX, startOffsetY, endOffsetX, endOffsetY])
            }
            canvas.onmouseleave = done;
            canvas.onmouseup = done;
            

            function done(e) {
                canvas.onmouseup = null;
                canvas.onmouseleave = null;
                canvas.onmousemove = null;
                const [endDataX, endDataY] = xy2DataXY(e.offsetX, e.offsetY);
                select([startDataX, startDataY, endDataX, endDataY]);
                drawCover();
            }
        }

        // 绘制拾取的辅助线
        function drawCover(coverRects?: number[]) {
            coverCtx.clearRect(0, 0, canvasSize, canvasSize);
            if(!coverRects) return;
            const [startOffsetX, startOffsetY, endOffsetX, endOffsetY] = coverRects;
            const x = startOffsetX / window.devicePixelRatio;
            const y = startOffsetY / window.devicePixelRatio;
            const width = (endOffsetX - startOffsetX) / window.devicePixelRatio;
            const height = (endOffsetY - startOffsetY) / window.devicePixelRatio;
            coverCtx.strokeRect(x, y, width, height);
            coverCtx.stroke();
        }

        // 绘制数据
        function draw() {
            ctx.clearRect(0, 0, 200, 200);
            drawRects(rects);
            drawLine();
        }

        function drawRects(rects: any[]) {
            rects.forEach(rect => {
                const { id, type = 'ground' } = rect;
                const [x, y] = id2CanvasXY(id);
                ctx.beginPath();
                ctx.fillStyle = getColor(type);
                ctx.fillRect(x * rectSize + padding, y * rectSize + padding, rectSize - padding, rectSize - padding);
            })
        }

        function drawLine() {
            ctx.beginPath();
            ctx.strokeStyle = '#00f';
            ctx.moveTo(100, 0);
            ctx.lineTo(100, 200);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = '#f00';
            ctx.moveTo(0, 100);
            ctx.lineTo(200, 100);
            ctx.stroke();
        }

        function getColor(type: RectType) {
            switch(type) {
                case 'grass':
                    return '#0c0';
                case 'sand':
                    return '#cc0';
                case 'ground':
                    return '#ccc';
                case 'forbid':
                    return '#f00';
                case 'rock':
                    return '#555';
            }
        }

        function id2CanvasXY(id: string) {
            const [x, y] = id.split('.');
            const canvasX = halfSize + Number(x);
            const canvasY  = halfSize + Number(y);
            return [canvasX, canvasY];
        }

        function xy2DataXY(x: number, y: number) {
            // 0 -> +400 =>
            // 0 -> +200 =>
            // -18 -> +18
            // 200 50
            const dataX = Math.floor((x / canvasScale)/rectSize);
            const dataY = Math.floor((y / canvasScale)/rectSize);
            return [dataX, dataY];
        }

        function xy2idXY(x: number, y: number) {
            // 0 -> +400 =>
            // 0 -> +200 =>
            // -18 -> +18
            const idX = Math.floor((x / canvasScale)/rectSize) - size/2;
            const idY = Math.floor((y / canvasScale)/rectSize) - size/2;
            return [idX, idY];
        }
       
    }, [])
    


    return <div style={{ height: '400px', position: 'relative' }}>
        <canvas id="canvas" style={{
            width: '400px',
            height: '100%',
            outline: 'none',
        }}/>
        <canvas id="coverCanvas" style={{
            width: '400px',
            height: '100%',
            outline: 'none',
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none',
        }}></canvas>
        <div style={{float: 'right'}}>
            {rectType}
            <br />
            {
                [
                    {  gridType: 'grass', color: '#0c0' },
                    {  gridType: 'sand', color: '#cc0' },
                    {  gridType: 'ground', color: '#ccc' },
                    {  gridType: 'forbid', color: '#f00' },
                    {  gridType: 'rock', color: '#555' },
                ].map((item, index) => {
                    const{ gridType, color } = item;
                    return  <div key={index} style={{margin: '10px', width: '50px', height: '20px', background: color, textAlign: 'center', lineHeight:'20px'}} onClick={() => {
                        setRectType(gridType);
                        type = gridType;
                    }}>{gridType}</div>
                })
            }
            <button onClick={() => {
                outputData()
            }}> export </button>
        </div>
    </div>
};