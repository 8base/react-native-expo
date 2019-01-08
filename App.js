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

import gql from 'graphql-tag';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { Query } from "react-apollo";

/*
  You need to swap out the Auth0 client id and domain with
  the one from your Auth0 client.

  In your Auth0 clent, you need to also add a url to your authorized redirect urls.
  For this application, we added https://auth.expo.io/@8base/react-native-example because
  our account on Expo is "8base" and the slug for this app is "react-native-example".
  You can open this app in the Expo client and check your logs for "Redirect URL (add this to Auth0)"
  to see what URL to add if the above is confusing.
*/
const auth0ClientId = 'qGHZVu5CxY5klivm28OPLjopvsYp0baD';
const auth0Domain = 'https://8base.auth0.com';


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

export default class App extends React.Component {
  state = {
    username: undefined,
  };

  _loginWithAuth0 = async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    console.log(`Redirect URL (add this to Auth0): ${redirectUrl}`);
    const result = await AuthSession.startAsync({
      authUrl: `${auth0Domain}/authorize` + toQueryString({
        client_id: auth0ClientId,
        response_type: 'id_token',
        scope: 'openid profile',
        redirect_uri: redirectUrl,
        nonce: 'fakenonce'
      }),
    });

    console.log(result);
    if (result.type === 'success') {
      this.handleParams(result.params);
    }
  }

  handleParams = (responseObj) => {
    console.log('responseObj:', responseObj);
    if (responseObj.error) {
      Alert.alert('Error', responseObj.error_description
        || 'something went wrong while logging in');
      return;
    }
    const encodedToken = responseObj.id_token;
    const decodedToken = jwtDecoder(encodedToken);
    const username = decodedToken.name;
    console.log('decodedToken', decodedToken);
    this.setState({ username });
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <Query query={GET_PROPERTY}>
          {({ loading, error, data }) => {
            
            if (loading) return <Text style={styles.title}>Loading...</Text>;
            if (error) return <Text style={styles.title}>Error! {error.message}</Text>;

            return (
              <Text style={styles.title}>Test data: {data.property.title}</Text>
            );
          }}
        </Query>
        <View style={styles.container}>
          {this.state.username !== undefined ?
            <Text style={styles.title}>Hi {this.state.username}!</Text> :
            <View>
              <Text style={styles.title}>Example: Auth0 login</Text>
              <Button title="Login with Auth0" onPress={this._loginWithAuth0} />
            </View>
          }
        </View>
      </ApolloProvider>
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