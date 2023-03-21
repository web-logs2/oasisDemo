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

    function setRectData(index: number, rectType?: RectType) {
        const rect = rects[index];
        if(rect) {
            rect.type = rectType ? rectType : type;
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
                    setRectData(index);
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

        function id2DataXY(id: string) {
            return id2CanvasXY(id);
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

        // 加载一份数据 - 使用 mock 数据绘制原始地图
        document.getElementById('loadBtn')!.onclick = () => {
            rects.forEach(rect => rect.type = 'ground');

            const mockGrids =[{"id":"-11.0","type":"sand"},{"id":"-11.1","type":"sand"},{"id":"-10.-7","type":"sand"},{"id":"-10.-6","type":"sand"},{"id":"-10.-2","type":"sand"},{"id":"-10.-1","type":"sand"},{"id":"-10.0","type":"sand"},{"id":"-10.1","type":"sand"},{"id":"-10.2","type":"sand"},{"id":"-9.-9","type":"sand"},{"id":"-9.-8","type":"sand"},{"id":"-9.-7","type":"sand"},{"id":"-9.-6","type":"sand"},{"id":"-9.-5","type":"sand"},{"id":"-9.-4","type":"sand"},{"id":"-9.-3","type":"sand"},{"id":"-9.-2","type":"sand"},{"id":"-9.-1","type":"sand"},{"id":"-9.0","type":"grass"},{"id":"-9.1","type":"sand"},{"id":"-9.2","type":"sand"},{"id":"-9.3","type":"sand"},{"id":"-9.4","type":"sand"},{"id":"-8.-9","type":"sand"},{"id":"-8.-8","type":"sand"},{"id":"-8.-7","type":"sand"},{"id":"-8.-6","type":"sand"},{"id":"-8.-5","type":"sand"},{"id":"-8.-4","type":"sand"},{"id":"-8.-3","type":"grass"},{"id":"-8.-2","type":"grass"},{"id":"-8.-1","type":"grass"},{"id":"-8.0","type":"grass"},{"id":"-8.1","type":"sand"},{"id":"-8.2","type":"sand"},{"id":"-8.3","type":"sand"},{"id":"-8.4","type":"sand"},{"id":"-8.5","type":"sand"},{"id":"-7.-10","type":"grass"},{"id":"-7.-9","type":"grass"},{"id":"-7.-8","type":"grass"},{"id":"-7.-7","type":"sand"},{"id":"-7.-6","type":"sand"},{"id":"-7.-5","type":"sand"},{"id":"-7.-4","type":"grass"},{"id":"-7.-3","type":"grass"},{"id":"-7.-2","type":"grass"},{"id":"-7.-1","type":"grass"},{"id":"-7.0","type":"grass"},{"id":"-7.1","type":"grass"},{"id":"-7.2","type":"sand"},{"id":"-7.3","type":"sand"},{"id":"-7.4","type":"sand"},{"id":"-7.5","type":"sand"},{"id":"-6.-11","type":"grass"},{"id":"-6.-10","type":"grass"},{"id":"-6.-9","type":"grass"},{"id":"-6.-8","type":"rock"},{"id":"-6.-7","type":"rock"},{"id":"-6.-6","type":"rock"},{"id":"-6.-5","type":"grass"},{"id":"-6.-4","type":"grass"},{"id":"-6.-3","type":"grass"},{"id":"-6.-2","type":"grass"},{"id":"-6.-1","type":"grass"},{"id":"-6.0","type":"grass"},{"id":"-6.1","type":"grass"},{"id":"-6.2","type":"grass"},{"id":"-6.3","type":"sand"},{"id":"-6.4","type":"sand"},{"id":"-6.5","type":"sand"},{"id":"-6.6","type":"sand"},{"id":"-6.7","type":"sand"},{"id":"-5.-11","type":"grass"},{"id":"-5.-10","type":"grass"},{"id":"-5.-9","type":"grass"},{"id":"-5.-8","type":"rock"},{"id":"-5.-7","type":"rock"},{"id":"-5.-6","type":"rock"},{"id":"-5.-5","type":"grass"},{"id":"-5.-4","type":"grass"},{"id":"-5.-3","type":"grass"},{"id":"-5.-2","type":"rock"},{"id":"-5.-1","type":"rock"},{"id":"-5.0","type":"grass"},{"id":"-5.1","type":"grass"},{"id":"-5.2","type":"grass"},{"id":"-5.3","type":"grass"},{"id":"-5.4","type":"grass"},{"id":"-5.5","type":"sand"},{"id":"-5.6","type":"sand"},{"id":"-5.7","type":"sand"},{"id":"-4.-13","type":"sand"},{"id":"-4.-12","type":"sand"},{"id":"-4.-11","type":"grass"},{"id":"-4.-10","type":"grass"},{"id":"-4.-9","type":"rock"},{"id":"-4.-8","type":"rock"},{"id":"-4.-7","type":"rock"},{"id":"-4.-6","type":"rock"},{"id":"-4.-5","type":"rock"},{"id":"-4.-4","type":"grass"},{"id":"-4.-3","type":"grass"},{"id":"-4.-2","type":"rock"},{"id":"-4.-1","type":"grass"},{"id":"-4.0","type":"rock"},{"id":"-4.1","type":"rock"},{"id":"-4.2","type":"grass"},{"id":"-4.3","type":"grass"},{"id":"-4.4","type":"grass"},{"id":"-4.5","type":"grass"},{"id":"-4.6","type":"sand"},{"id":"-4.7","type":"sand"},{"id":"-4.8","type":"sand"},{"id":"-3.-14","type":"sand"},{"id":"-3.-13","type":"sand"},{"id":"-3.-12","type":"grass"},{"id":"-3.-11","type":"grass"},{"id":"-3.-10","type":"grass"},{"id":"-3.-9","type":"rock"},{"id":"-3.-8","type":"rock"},{"id":"-3.-7","type":"grass"},{"id":"-3.-6","type":"rock"},{"id":"-3.-5","type":"grass"},{"id":"-3.-4","type":"rock"},{"id":"-3.-3","type":"rock"},{"id":"-3.-2","type":"rock"},{"id":"-3.-1","type":"grass"},{"id":"-3.0","type":"rock"},{"id":"-3.1","type":"grass"},{"id":"-3.2","type":"grass"},{"id":"-3.3","type":"grass"},{"id":"-3.4","type":"grass"},{"id":"-3.5","type":"sand"},{"id":"-3.6","type":"sand"},{"id":"-3.7","type":"sand"},{"id":"-2.-15","type":"sand"},{"id":"-2.-14","type":"sand"},{"id":"-2.-13","type":"sand"},{"id":"-2.-12","type":"grass"},{"id":"-2.-11","type":"grass"},{"id":"-2.-10","type":"rock"},{"id":"-2.-9","type":"rock"},{"id":"-2.-8","type":"rock"},{"id":"-2.-7","type":"rock"},{"id":"-2.-6","type":"rock"},{"id":"-2.-5","type":"rock"},{"id":"-2.-4","type":"rock"},{"id":"-2.-3","type":"grass"},{"id":"-2.-2","type":"rock"},{"id":"-2.-1","type":"grass"},{"id":"-2.0","type":"grass"},{"id":"-2.1","type":"rock"},{"id":"-2.2","type":"grass"},{"id":"-2.3","type":"grass"},{"id":"-2.4","type":"grass"},{"id":"-2.5","type":"grass"},{"id":"-2.6","type":"sand"},{"id":"-2.7","type":"sand"},{"id":"-1.-15","type":"sand"},{"id":"-1.-14","type":"sand"},{"id":"-1.-13","type":"rock"},{"id":"-1.-12","type":"rock"},{"id":"-1.-11","type":"rock"},{"id":"-1.-10","type":"rock"},{"id":"-1.-9","type":"rock"},{"id":"-1.-8","type":"rock"},{"id":"-1.-7","type":"rock"},{"id":"-1.-6","type":"rock"},{"id":"-1.-5","type":"grass"},{"id":"-1.-4","type":"rock"},{"id":"-1.-3","type":"rock"},{"id":"-1.-2","type":"rock"},{"id":"-1.-1","type":"rock"},{"id":"-1.0","type":"rock"},{"id":"-1.1","type":"rock"},{"id":"-1.2","type":"rock"},{"id":"-1.3","type":"grass"},{"id":"-1.4","type":"grass"},{"id":"-1.5","type":"sand"},{"id":"-1.6","type":"sand"},{"id":"-1.7","type":"sand"},{"id":"-1.8","type":"sand"},{"id":"-1.9","type":"sand"},{"id":"0.-15","type":"sand"},{"id":"0.-14","type":"grass"},{"id":"0.-13","type":"rock"},{"id":"0.-12","type":"rock"},{"id":"0.-11","type":"rock"},{"id":"0.-10","type":"rock"},{"id":"0.-9","type":"rock"},{"id":"0.-8","type":"rock"},{"id":"0.-7","type":"rock"},{"id":"0.-6","type":"rock"},{"id":"0.-5","type":"rock"},{"id":"0.-4","type":"rock"},{"id":"0.-3","type":"rock"},{"id":"0.-2","type":"rock"},{"id":"0.-1","type":"rock"},{"id":"0.0","type":"rock"},{"id":"0.1","type":"rock"},{"id":"0.2","type":"rock"},{"id":"0.3","type":"grass"},{"id":"0.4","type":"grass"},{"id":"0.5","type":"sand"},{"id":"0.6","type":"sand"},{"id":"0.7","type":"sand"},{"id":"0.8","type":"sand"},{"id":"0.9","type":"sand"},{"id":"1.-14","type":"grass"},{"id":"1.-13","type":"rock"},{"id":"1.-12","type":"rock"},{"id":"1.-11","type":"rock"},{"id":"1.-10","type":"grass"},{"id":"1.-9","type":"rock"},{"id":"1.-8","type":"rock"},{"id":"1.-7","type":"rock"},{"id":"1.-6","type":"rock"},{"id":"1.-5","type":"rock"},{"id":"1.-4","type":"rock"},{"id":"1.-3","type":"rock"},{"id":"1.-2","type":"rock"},{"id":"1.-1","type":"rock"},{"id":"1.0","type":"rock"},{"id":"1.1","type":"rock"},{"id":"1.2","type":"grass"},{"id":"1.3","type":"sand"},{"id":"1.4","type":"grass"},{"id":"1.5","type":"sand"},{"id":"1.6","type":"sand"},{"id":"1.7","type":"sand"},{"id":"1.8","type":"sand"},{"id":"1.9","type":"sand"},{"id":"2.-15","type":"grass"},{"id":"2.-14","type":"grass"},{"id":"2.-13","type":"grass"},{"id":"2.-12","type":"grass"},{"id":"2.-11","type":"rock"},{"id":"2.-10","type":"rock"},{"id":"2.-9","type":"grass"},{"id":"2.-8","type":"grass"},{"id":"2.-7","type":"grass"},{"id":"2.-6","type":"rock"},{"id":"2.-5","type":"rock"},{"id":"2.-4","type":"grass"},{"id":"2.-3","type":"rock"},{"id":"2.-2","type":"rock"},{"id":"2.-1","type":"grass"},{"id":"2.0","type":"grass"},{"id":"2.1","type":"sand"},{"id":"2.2","type":"sand"},{"id":"2.3","type":"sand"},{"id":"2.4","type":"sand"},{"id":"2.5","type":"sand"},{"id":"2.6","type":"sand"},{"id":"2.7","type":"sand"},{"id":"2.8","type":"sand"},{"id":"3.-16","type":"rock"},{"id":"3.-15","type":"grass"},{"id":"3.-14","type":"grass"},{"id":"3.-13","type":"grass"},{"id":"3.-12","type":"grass"},{"id":"3.-11","type":"rock"},{"id":"3.-10","type":"rock"},{"id":"3.-9","type":"grass"},{"id":"3.-8","type":"grass"},{"id":"3.-7","type":"grass"},{"id":"3.-6","type":"grass"},{"id":"3.-5","type":"grass"},{"id":"3.-4","type":"rock"},{"id":"3.-3","type":"grass"},{"id":"3.-2","type":"grass"},{"id":"3.-1","type":"grass"},{"id":"3.0","type":"grass"},{"id":"3.1","type":"sand"},{"id":"3.2","type":"sand"},{"id":"3.3","type":"sand"},{"id":"3.4","type":"sand"},{"id":"3.5","type":"sand"},{"id":"3.6","type":"sand"},{"id":"4.-16","type":"rock"},{"id":"4.-15","type":"rock"},{"id":"4.-14","type":"grass"},{"id":"4.-13","type":"grass"},{"id":"4.-12","type":"grass"},{"id":"4.-9","type":"rock"},{"id":"4.-8","type":"rock"},{"id":"4.-7","type":"grass"},{"id":"4.-6","type":"grass"},{"id":"4.-5","type":"grass"},{"id":"4.-4","type":"grass"},{"id":"4.-3","type":"grass"},{"id":"4.-2","type":"grass"},{"id":"4.-1","type":"grass"},{"id":"4.0","type":"grass"},{"id":"4.1","type":"sand"},{"id":"4.2","type":"sand"},{"id":"4.3","type":"sand"},{"id":"4.4","type":"sand"},{"id":"4.5","type":"sand"},{"id":"4.6","type":"sand"},{"id":"5.-15","type":"rock"},{"id":"5.-14","type":"rock"},{"id":"5.-13","type":"rock"},{"id":"5.-12","type":"rock"},{"id":"5.-9","type":"sand"},{"id":"5.-8","type":"rock"},{"id":"5.-7","type":"rock"},{"id":"5.-6","type":"sand"},{"id":"5.-5","type":"sand"},{"id":"5.-4","type":"grass"},{"id":"5.-3","type":"grass"},{"id":"5.-2","type":"grass"},{"id":"5.-1","type":"grass"},{"id":"5.0","type":"sand"},{"id":"5.1","type":"sand"},{"id":"5.2","type":"sand"},{"id":"5.3","type":"sand"},{"id":"5.4","type":"sand"},{"id":"5.5","type":"sand"},{"id":"6.-14","type":"rock"},{"id":"6.-13","type":"rock"},{"id":"6.-8","type":"sand"},{"id":"6.-7","type":"sand"},{"id":"6.-6","type":"sand"},{"id":"6.-5","type":"sand"},{"id":"6.-4","type":"rock"},{"id":"6.-3","type":"rock"},{"id":"6.-2","type":"rock"},{"id":"6.-1","type":"rock"},{"id":"6.0","type":"sand"},{"id":"6.1","type":"sand"},{"id":"6.2","type":"sand"},{"id":"6.3","type":"sand"},{"id":"7.-5","type":"sand"},{"id":"7.-4","type":"sand"},{"id":"7.-3","type":"rock"},{"id":"7.-2","type":"rock"},{"id":"7.-1","type":"rock"},{"id":"7.0","type":"rock"}]

            mockGrids.forEach(mockGrid => {
                const { id, type: rectType } = mockGrid;
                const [x, y] = id2DataXY(id);
                if(rectType) {
                    const index = x * (size) + y;
                    setRectData(index, rectType as RectType);
                }
            })
            draw();
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
            <button id='loadBtn'>loadRects</button>
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