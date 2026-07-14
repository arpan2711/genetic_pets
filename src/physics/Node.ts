export class PNode {
  x: number;
  y: number;
  oldX: number;
  oldY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
  }
}
