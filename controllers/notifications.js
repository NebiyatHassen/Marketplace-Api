const { Expo } = require("expo-server-sdk");

const sendPushNotification = async (targetExpoPushToken, message) => {
  const expo = new Expo();
  const chunks = expo.chunkPushNotifications([
    {
      to: targetExpoPushToken, // Using the provided targetExpoPushToken
      sound: "default",
      body: message, // Using the provided message variable
    },
  ]);

  const sendChunks = async () => {
    try {
      const tickets = await Promise.all(
        chunks.map((chunk) => expo.sendPushNotificationsAsync(chunk))
      );
      // Process tickets or handle success here
    } catch (error) {
      console.log("Error sending chunks", error);
      // Handle error here
    }
  };

  await sendChunks();
};

module.exports = sendPushNotification;
