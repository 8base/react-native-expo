import { AuthSession } from 'expo';
import React from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import jwtDecoder from 'jwt-decode';
import { AuthContext, AuthProvider } from '@8base/auth';
import { ReactNativeAuth0AuthClient } from '@8base/react-native-auth0-auth-client';

import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { Query } from "react-apollo";

//import { AuthProvider, AuthConsumer } from '@8base/auth';
//import { ReactNativeAuth0AuthClient } from '@8base/react-native-auth0-auth-client';

/*
  You need to swap out the Auth0 client id and domain with
  the one from your Auth0 client.

  In your Auth0 clent, you need to also add a url to your authorized redirect urls.
  For this application, we added https://auth.expo.io/@8base/react-native-example because
  our account on Expo is "8base" and the slug for this app is "react-native-example".
  You can open this app in the Expo client and check your logs for "Redirect URL (add this to Auth0)"
  to see what URL to add if the above is confusing.
*/
const auth0ClientId = 'VsfnxFXXF6bSHnmGat9uCXmavupN3ZOa';
const auth0Domain = 'https://8base-dev.auth0.com';

const httpLink = createHttpLink({
  uri: 'https://api.8base.com/cjnl27kn1000c01p6u3grcqsb',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = 'bc133e2c-e6e1-4778-a939-c453d0959780';
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

const GET_PROPERTY = gql`
{
  property(id: "cjpifxm2b000101qq83xttldp") {
    id
    title
  }
}
`;

  /**
   * Converts an object to a query string.
   */
function toQueryString(params) {
  return '?' + Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

const authClient = new ReactNativeAuth0AuthClient({
  clientId: auth0ClientId,
  domain: auth0Domain,
});


export default class App extends React.Component {

  renderAuthView = (auth) => {
    console.log('auth', auth);

    const login = async () => {
      console.log('start login');

      const authData = await auth.authorize();

      console.log('authData', authData);

      await auth.setAuthState({
        token: authData.idToken,
        email: authData.email,
      });
    };

    const logout = async () => {
      console.log('start logout');

      await auth.purgeAuthState();
    };

    if (!auth.isAuthorized) {
      return (
        <View>
          <Text style={styles.title}>Example: Auth0 login</Text>
          <Button title="Login with Auth0" onPress={ login } />
        </View>
      );
    }

    return (
      <View>
        <Text>{ auth.authState.email }</Text>
        <Text style={styles.title}>Example: Auth0 logout</Text>
        <Button title="Logout with Auth0" onPress={ logout } />
      </View>
    );
  };

  render() {
    return (
      <AuthProvider authClient={ authClient }>
        <View style={styles.container}>
          <AuthContext.Consumer>
            { this.renderAuthView }
          </AuthContext.Consumer>
        </View>
      </AuthProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
});
