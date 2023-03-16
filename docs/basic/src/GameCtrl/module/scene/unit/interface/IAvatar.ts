import { Entity } from "oasis-engine";
import { AvatarInfo } from "../../../../socket/AvatarInfo";
import { AvatarControl } from "../control/AvatarControl";

export interface IAvatar {
  data: AvatarInfo;
  entity: Entity;
  control: AvatarControl;
}
