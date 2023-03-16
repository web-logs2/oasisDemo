import { IAnimateInfo } from './interface';
import { floatUp } from './events';
import { Entity } from 'oasis-engine';

export default class FloatUP {
    play(info: IAnimateInfo) {
        floatUp(info.entity as Entity, info, () =>{
            
        })
    }
}