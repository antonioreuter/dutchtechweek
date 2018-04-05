const HueColorValueGreen = 25500;
const IncreasePercentage = 40;

const calculateHueColorNumber = (initialHeartbeat, currentHeartbeat, increasePercentage = IncreasePercentage) => {
  // console.log("Initial heartbeat: " + initialHeartbeat);
  // console.log("Current heartbeat: " + currentHeartbeat);
  // console.log("Increase Percentage: " + increasePercentage);

  maxHeartbeat = Math.round(initialHeartbeat + initialHeartbeat * (increasePercentage / 100));
  // console.log("Maximum heartbeat: " + maxHeartbeat);

  normalizedHeartbeat = Math.min(currentHeartbeat, maxHeartbeat);
  normalizedHeartbeat = Math.max(normalizedHeartbeat, initialHeartbeat);

  result = Math.round(((1 - ((normalizedHeartbeat - initialHeartbeat) / (maxHeartbeat - initialHeartbeat))) * HueColorValueGreen));
  return result;
};

const calculateBrightness = (count) => {
  return count % 2 == 0 ? 40 : 80;
};

module.exports = {
  calculateHueColorNumber,
  calculateBrightness
};