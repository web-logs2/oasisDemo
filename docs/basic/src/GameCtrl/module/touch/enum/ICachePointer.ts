import { PointerType } from "./IPointerType";

export interface CachePointer {
  type: PointerType;
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}
