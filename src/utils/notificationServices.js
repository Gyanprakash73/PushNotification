import messaging from '@react-native-firebase/messaging';
import NavigationService from '../Navigation/NavigationService';
import PushNotification from 'react-native-push-notification';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFcmToken();
  }
}

const getFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('fcm token:', token);
  } catch (error) {
    console.log('error in creating token');
  }
};

export async function notificationListeners() {
  //FOREGROUND STATE
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', remoteMessage);

    PushNotification.createChannel(
      {
        channelId: 'channel-id-1',
        channelName: 'My channel',
        channelDescription: 'A channel to categorise your notifications',
        playSound: true,
        soundName: 'default',
        vibrate: true,
      },
      created => console.log(`createChannel returned '${created}'`),
    );
    PushNotification.localNotification({
      channelId: 'channel-id-1', // (required)
      channelName: 'My channel',
      showWhen: true,
      when: new Date().getTime(),
      largeIcon: 'ic_notification',
      smallIcon: 'ic_notification',
      message: remoteMessage.notification.body,
      title: remoteMessage.notification.title,
      bigPictureUrl: remoteMessage.notification.android.imageUrl,
      smallIcon: remoteMessage.notification.android.imageUrl,
      //subText: 'This is a subText',
    });

    PushNotification.configure({
      onNotification: function (notification) {
        if (notification.userInteraction) {
          console.log('@@@ FOREGROUND STATE MESSAGE', notification);

          navigationBody(remoteMessage);
        }
      },
    });
  });

  //BACKGROUND STATE
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage,
    );

    navigationBody(remoteMessage);
  });

  //QUIT STATE
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );

        navigationBody(remoteMessage);
      }
    });

  return unsubscribe;
}

const navigationBody = remoteMessage => {
  if (
    !!remoteMessage?.data &&
    remoteMessage?.data?.redirect_to == 'ProductDetail'
  ) {
    setTimeout(() => {
      NavigationService.navigate('ProductDetail', {
        data: remoteMessage?.data,
      });
    }, 1200);
  }

  if (!!remoteMessage?.data && remoteMessage?.data?.redirect_to == 'Profile') {
    setTimeout(() => {
      NavigationService.navigate('Profile', {
        data: remoteMessage?.data,
      });
    }, 1200);
  }
};
