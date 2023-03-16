import { GameCtrl } from "../../..";
import { AvatarInfo } from "../../../socket/AvatarInfo";
import { SceneDataManager } from "../SceneDataManager";
import { IAvatar } from "./interface/IAvatar";
import { AvatarControl } from "./control/AvatarControl";

export class UnitFactory {
  static createUnit(data: AvatarInfo): IAvatar {
    const entity = GameCtrl.ins.root.createChild(data.id + "");
    const avatarControl = entity.addComponent(AvatarControl);
    avatarControl.setScale(SceneDataManager.avatarScale);
    avatarControl.setData(data);
    return { data, entity, control: avatarControl };
  }
}
