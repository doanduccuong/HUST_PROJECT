export class Customer {
  constructor({ id, name, identified, distance = 0, isNew = false, emotion = "neutral", gazeDirection = "Trực diện", gazeYaw = 0.0, distanceM = 0.0, standingPosition = "Vừa phải", userImage = null }) {
    this.id = id;
    this.name = name;
    this.identified = identified;
    this.distance = distance;
    this.isNew = isNew;
    this.emotion = emotion;
    this.gazeDirection = gazeDirection;
    this.gazeYaw = gazeYaw;
    this.distanceM = distanceM;
    this.standingPosition = standingPosition;
    this.userImage = userImage;
  }
}
