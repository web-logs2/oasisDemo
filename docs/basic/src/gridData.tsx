import React, { useEffect, useState } from 'react';

type RectType = 'grass' | 'sand' | 'ground' | 'rock';
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

let type = 'ground'
const size = 36;
const halfSize = size / 2;
const rectSize = 200 / size;
const padding = 1;
const rects = defaultData(size);

export default () => {
    const [rectType, setRectType] =  useState('ground');

    function outputData() {
        const outData = rects.filter(rect => rect.type && rect.type !== 'ground');
        console.log(JSON.stringify(outData));
    }

    function setType(index: number) {
        const rect = rects[index];
        rect.type = type;
    }

    useEffect(() => {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const canvasSize = 200;
        const canvasStyleSize = 400;
        const canvasScale = canvasStyleSize / canvasSize;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
       
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        draw();
        
        canvas.onclick = (e) => {
            const [dataX, dataY] = xy2DataXY(e.offsetX, e.offsetY);
            // const rect = rects[dataX * (size) + dataY];
            // rect.type = type;
            const index = dataX * (size) + dataY;
            setType(index);
            draw();
        }

        function draw() {
            ctx.clearRect(0, 0, 200, 200);
            drawRects(rects);
            drawLine();
        }

        function drawRects(rects: any[]) {
            // console.log(rects[0])
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
    


    return <div style={{ height: '400px' }}>
        <canvas id="canvas" style={{
            width: '400px',
            height: '100%',
            outline: 'none',
        }}/>
        <div style={{float: 'right'}}>
            {rectType}
            <br />
            <div style={{margin: '10px', width: '50px', height: '20px', background: '#0c0', textAlign: 'center', lineHeight:'20px'}} onClick={() => {
                setRectType('grass');
                type = 'grass';
            }}>grass</div>
            <div style={{margin: '10px', width: '50px', height: '20px', background: '#cc0', textAlign: 'center', lineHeight:'20px'}} onClick={() => {
                setRectType('sand')
                type = 'sand';
            }}>sand</div>
            <div style={{margin: '10px', width: '50px', height: '20px', background: '#ccc', textAlign: 'center', lineHeight:'20px'}} onClick={() => {
                setRectType('ground')
                type = 'ground';
            }}>ground</div>
            <div style={{margin: '10px', width: '50px', height: '20px', background: '#555', textAlign: 'center', lineHeight:'20px'}} onClick={() => {
                setRectType('rock')
                type = 'rock';
            }}>rock</div>
            <button onClick={() => {
                outputData()
            }}> export </button>
        </div>
    </div>
};