import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { authorize } from 'react-native-app-auth';
import { Button, View, Text, Switch } from "react-native";

// create an Android oauth app at https://console.developers.google.com/apis/credentials to get this value
const androidClientId = "...";

export default function App() {
  const [authResponse, setAuthResponse] = React.useState(null);
  const [browserOptions, setBrowserOptions] = React.useState({
    showInRecents: false,
    createTask: true,
    falseToggle: false,
  });

  // useAuthRequest
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
  });

  React.useEffect(() => {
    console.log("root view remounted");
  }, []);

  React.useEffect(() => {
    setAuthResponse(response);
    if (response?.type === "success") {
      const { authentication } = response;
    }
  }, [response]);



  // react-native-app-auth
  const config = {
    issuer: 'https://accounts.google.com',
    clientId: androidClientId,
    redirectUrl: 'com.keithkurak.chromecustomtabsissue:/oauth2redirect/',
    scopes: ['openid', 'profile']
  };

  const launchReactNativeAppAuth = React.useCallback(() => {
    (async function doStuff() {
      const authState = await authorize(config);
      setAuthResponse(authState);
    })();
  });

  // expo-web-browser openAuthSessionAsync
  const openExpoWebBrowserAuthSession = React.useCallback(() => {
    (async function doStuff() {
      const authState = await WebBrowser.openAuthSessionAsync(
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${androidClientId}&redirect_uri=com.keithkurak.chromecustomtabsissue:/oauth2redirect/&response_type=code&scope=openid%20profile`,
        'com.keithkurak.chromecustomtabsissue:/oauth2redirect/',
        browserOptions
      );
      setAuthResponse(authState);
    })();
  }, [browserOptions])

  // openAuthSessionAsync with a rake redirect (no oauth config required)
  const openFakeAuthSession =  React.useCallback(() => {
    (async function doStuff() {
      try {
        let result = await WebBrowser.openAuthSessionAsync(
          // We add `?` at the end of the URL since the test backend that is used
          // just appends `authToken=<token>` to the URL provided.
          `https://band-shorthaired-fear.glitch.me/`,
          'customtabsissue://blah',
          browserOptions
        );
        console.log('auth browser dismissed');
        setAuthResponse(result);
      } catch (error) {
        alert(error);
        console.log(error);
      }
    })();
  }, [browserOptions]);

  return (
    <View
      style={{ flex: 1, marginHorizontal: 10, justifyContent: "space-around" }}
    >
      <View>
        <Button
          disabled={!request}
          title="Login with expo-auth-session"
          onPress={() => {
            promptAsync();
          }}
        />
        <Text>(no configuration options)</Text>
      </View>
      <View>
        <Button
          title="Login with react-native-app-auth"
          onPress={launchReactNativeAppAuth}
        />
        <Text>(no configuration options)</Text>
      </View>
      <View>
        <Button
          title="Login with expo-web-browser openAuthSessionAsync"
          onPress={openExpoWebBrowserAuthSession}
        />
        <Text>(accepts config options below)</Text>
      </View>
      <View>
        <Button
          title="Open page with openAuthSessionAsync (no oauth, but can redirect back)"
          onPress={openFakeAuthSession}
        />
        <Text>(accepts config options below)</Text>
      </View>
      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>showInRecents</Text>
          <Switch
            value={browserOptions.showInRecents}
            onValueChange={(val) => {
              setBrowserOptions({ ...browserOptions, showInRecents: val });
            }}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>createTask</Text>
          <Switch
            value={browserOptions.createTask}
            onValueChange={(val) => {
              setBrowserOptions({ ...browserOptions, createTask: val });
            }}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>false toggle (demo state restored after redirect)</Text>
          <Switch
            value={browserOptions.falseToggle}
            onValueChange={(val) => {
              setBrowserOptions({ ...browserOptions, falseToggle: val });
            }}
          />
        </View>
      </View>
      <View>
        <Text style={{ fontWeight: "bold" }}>Auth/ redirect response:</Text>
        <Text numberOfLines={5}>{JSON.stringify(authResponse)}</Text>
      </View>
    </View>
  );
}
