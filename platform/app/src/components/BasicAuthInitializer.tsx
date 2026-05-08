import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuthentication } from '@ohif/ui-next';
import { loadAuth, clearAuth } from '../utils/basicAuth';

function BasicAuthInitializer({ userAuthenticationService }) {
  const [, { set, setUser }] = useUserAuthentication();

  useEffect(() => {
    const encoded = loadAuth();

    if (encoded) {
      setUser({ username: 'user' });
      userAuthenticationService.setServiceImplementation({
        getAuthorizationHeader: () => ({ Authorization: `Basic ${encoded}` }),
        handleUnauthenticated: () => {
          clearAuth();
          return <Navigate to="/login" replace />;
        },
      });
    } else {
      const configAuth = (window as any).config?.dataSources?.[0]?.configuration?.requestOptions
        ?.headers?.Authorization;
      userAuthenticationService.setServiceImplementation({
        getAuthorizationHeader: () => (configAuth ? { Authorization: configAuth } : {}),
        handleUnauthenticated: () => <Navigate to="/login" replace />,
      });
    }

    set({ enabled: true });
  }, []);

  return null;
}

export default BasicAuthInitializer;
