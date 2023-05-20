import './style.css'
// @ts-ignore
import {SVGPathData} from "svg-pathdata";
import {BoundingBox, PathElement, PathParser, Point, RenderingContext2D} from "canvg";
import p5 from 'p5';
import {Howl, Howler} from 'howler';
// @ts-ignore
import {SVGCommand} from "svg-pathdata/lib/types";

Howler.volume(1);

const tattooPaths = {
    anchor: "M437.339,320.012h-42.667c-5.867,0-10.667,4.8-10.667,10.667c0,5.867,4.8,10.667,10.667,10.667h31.68c-5.227,82.56-71.467,144.213-159.68,148.907V213.345h85.333c5.867,0,10.667-4.8,10.667-10.667c0-5.867-4.8-10.667-10.667-10.667h-85.333v-86.4c28.907-5.867,47.467-34.027,41.6-62.933c-5.867-28.8-34.027-47.467-62.933-41.6c-28.907,5.867-47.467,34.133-41.6,62.933c4.267,20.907,20.693,37.333,41.6,41.6v86.4h-85.333c-5.867,0-10.667,4.8-10.667,10.667c0,5.867,4.8,10.667,10.667,10.667h85.333v276.907c-88.107-4.693-154.347-66.347-159.68-148.907h31.68c5.867,0,10.667-4.8,10.667-10.667c0-5.867-4.8-10.667-10.667-10.667H74.672c-5.867,0-10.667,4.8-10.667,10.667c0,103.36,82.56,181.333,192,181.333s192-77.973,192-181.333C448.006,324.811,443.206,320.012,437.339,320.012z M224.006,53.345c0-17.707,14.293-32,32-32s32,14.293,32,32s-14.293,32-32,32S224.006,71.051,224.006,53.345z"
}

class TattooLayer {
    private pathParser: PathParser;

    constructor(pathString: string) {
        this.pathParser = new PathParser(pathString);
    }

    draw(ctx: RenderingContext2D) {
        const { pathParser } = this;
        const boundingBox = new BoundingBox();

        pathParser.reset();

        ctx.beginPath();

        while(!pathParser.isEnd()) {
            const command: SVGCommand = pathParser.next();

            switch(command.type) {
                case SVGPathData.MOVE_TO:
                    this.pathM(ctx, boundingBox);
                    break;
                case SVGPathData.LINE_TO:
                    this.pathL(ctx, boundingBox);
                    break;
                case SVGPathData.HORIZ_LINE_TO:
                    this.pathH(ctx, boundingBox);
                    break;
                case SVGPathData.VERT_LINE_TO:
                    this.pathV(ctx, boundingBox);
                    break;
                case SVGPathData.CURVE_TO:
                    this.pathC(ctx, boundingBox);
                    break;
                case SVGPathData.SMOOTH_CURVE_TO:
                    this.pathS(ctx, boundingBox);
                    break;
                case SVGPathData.CLOSE_PATH:
                    this.pathZ(ctx, boundingBox);
                    break;
                default:
                    console.log('not handled', command);
            }
        }

        ctx.fill();
        ctx.stroke();
    }

    getMarkerPoints(): Point[] {
        return this.pathParser.getMarkerPoints();
    }

    getMarkerAngles(): number[] {
        return this.pathParser.getMarkerAngles();
    }

    get commands() {
        return this.pathParser.commands;
    }

    addCommands(commands: SVGCommand[]) {
        this.pathParser.commands.push(...commands);
    }

    get current() {
        return this.pathParser.current;
    }

    getMarkers() {
        const points = this.getMarkerPoints();
        const angles = this.getMarkerAngles();
        return points.map((point, i) => [
                point,
                angles[i]
            ]
        );
    }

    getTotalPathLength(): number {
        const path: SVGPathElement = document.querySelector('svg#calc-svg > path')!;
        path.setAttribute('d', SVGPathData.encode(this.pathParser.commands));
        return path.getTotalLength();
    }

    pathM(ctx: RenderingContext2D | null, boundingBox: BoundingBox) {
        const { pathParser  } = this;
        const { point } = PathElement.pathM(pathParser);
        const { x , y  } = point;
        pathParser.addMarker(point);
        boundingBox.addPoint(x, y);
        if(ctx) {
            ctx.moveTo(x, y);
        }
    }

    pathL(ctx: RenderingContext2D | null, boundingBox: BoundingBox) {
        const { pathParser } = this;
        const { current , point  } = PathElement.pathL(pathParser);
        const { x, y } = point;
        pathParser.addMarker(point, current);
        boundingBox.addPoint(x, y);
        if(ctx) {
            ctx.lineTo(x, y);
        }
    }

    pathH(ctx: RenderingContext2D | null, boundingBox: BoundingBox) {
        const { pathParser } = this;
        const { current , point  } = PathElement.pathH(pathParser);
        const { x, y } = point;
        pathParser.addMarker(point, current);
        boundingBox.addPoint(x, y);
        if(ctx) {
            ctx.lineTo(x, y);
        }
    }

    pathV(ctx: RenderingContext2D | null, boundingBox: BoundingBox) {
        const { pathParser } = this;
        const { current , point  } = PathElement.pathV(pathParser);
        const { x, y } = point;
        pathParser.addMarker(point, current);
        boundingBox.addPoint(x, y);
        if(ctx) {
            ctx.lineTo(x, y);
        }
    }

    pathC(ctx: RenderingContext2D | null, boundingBox: BoundingBox) {
        const { pathParser } = this;
        const { current , point , controlPoint , currentPoint  } = PathElement.pathC(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, point);
        boundingBox.addBezierCurve(current.x, current.y, point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if(ctx) {
            ctx.bezierCurveTo(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }

    pathS(ctx: RenderingContext2D | null, boundingBox: BoundingBox) {
        const { pathParser } = this;
        const { current , point , controlPoint , currentPoint  } = PathElement.pathS(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, point);
        boundingBox.addBezierCurve(current.x, current.y, point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if(ctx) {
            ctx.bezierCurveTo(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }

    pathZ(ctx: RenderingContext2D | null, boundingBox: BoundingBox) {
        const { pathParser } = this;
        PathElement.pathZ(pathParser);
        if(ctx) {
            if (boundingBox.x1 !== boundingBox.x2 && boundingBox.y1 !== boundingBox.y2) {
                ctx.closePath();
            }
        }
    }
}

const drawer = (sketch: p5) => {
    let sound: Howl;
    let tattooStencil = new TattooLayer(tattooPaths.anchor);
    let tattooDone = new TattooLayer(SVGPathData.encode([...tattooStencil.commands].splice(0, 2)));

    const drawLayer = (ctx: RenderingContext2D, layer: TattooLayer, color: p5.Color) => {
        sketch.stroke(color);
        layer.draw(ctx);
    }

    const drawPartialLayer = (_ctx: RenderingContext2D, layer: TattooLayer, progress: number) => {
        const pathLen = layer.getTotalPathLength();

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d')!;

        ctx.strokeStyle = '#000';
        ctx.fillStyle = 'transparent';
        ctx.lineWidth = 5;
        ctx.setLineDash([pathLen + 1]);
        ctx.lineDashOffset = pathLen - (pathLen * progress);
        layer.draw(ctx);

        _ctx.drawImage(canvas, 0, 0, 800, 800);
    }

    sketch.preload = () => {
        sound = new Howl({
            src: ['/sounds/tattoomachine.mp3'],
            autoplay: false,
            format: 'mp3',
            loop: false
        });
    }

    sketch.setup = () => {
        sketch.createCanvas(800, 800);
    }

    let progress = 0.8;
    let currentIdx = 0;
    let currentLen = 0;

    const LEN_PER_SECOND = 40;

    sketch.draw = () => {
        sketch.background(255);
        sketch.strokeWeight(3);

        drawLayer(sketch.drawingContext, tattooStencil, sketch.color(50, 0, 100));

        const totalLen = tattooDone.getTotalPathLength();

        if(currentLen < totalLen) {
            progress = currentLen / totalLen;
        } else {
            currentIdx++;
            progress = 1.0;
            sound.stop();
            tattooDone.commands.push(tattooStencil.commands[currentIdx+1]);
            return;
        }

        drawPartialLayer(sketch.drawingContext, tattooDone, progress);

        const mousePosition = new p5.Vector(sketch.mouseX, sketch.mouseY);
        const startPosition = new p5.Vector(tattooStencil.getMarkerPoints()[currentIdx].x, tattooStencil.getMarkerPoints()[currentIdx].y);
        const endPosition = new p5.Vector(tattooStencil.getMarkerPoints()[currentIdx+1].x, tattooStencil.getMarkerPoints()[currentIdx+1].y);
        const distance = startPosition.dist(mousePosition);

        if(distance <= 5.0) {
            sketch.stroke(255, 0, 0);

            if(sketch.mouseIsPressed) {
                sketch.circle(endPosition.x, endPosition.y, 5);
                currentLen += LEN_PER_SECOND * ( sketch.deltaTime / 1000 );

                if(!sound.playing()) {
                    sound.play();
                }
            }
            else {
                sound.stop();
            }

        } else {
            sketch.stroke(0, 0, 0);
            sound.stop();
        }

        sketch.circle(startPosition.x, startPosition.y, 5);
    }
}

new p5(drawer, document.getElementById('app')!);




