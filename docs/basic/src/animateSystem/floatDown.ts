import { floatDown } from './events';
import { IAnimateInfo } from './interface';
import { Entity } from 'oasis-engine';

export default class FloatDOWN {
    play(info: IAnimateInfo) {
        floatDown(info.entity as Entity, info, () =>{
            
        })
    }
}