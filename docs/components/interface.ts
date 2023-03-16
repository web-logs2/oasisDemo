import { PBRMaterial, BlinnPhongMaterial, PBRBaseMaterial, UnlitMaterial } from 'oasis-engine';

export type UniformMaterial = PBRMaterial | BlinnPhongMaterial | PBRBaseMaterial | UnlitMaterial;

export enum IEngineEvent {
    onPointerClick = 'onPointerClick',
}