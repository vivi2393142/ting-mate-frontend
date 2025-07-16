import { isAxiosError } from 'axios';
import { Stack, useRouter } from 'expo-router';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet } from 'react-native';

import { Text, TextInput } from 'react-native-paper';

import { useLogin, useRegister } from '@/api/auth';
import ROUTES from '@/constants/routes';
import useAppTheme from '@/hooks/useAppTheme';
import useStackScreenOptionsHelper from '@/hooks/useStackScreenOptionsHelper';
import useAuthStore from '@/store/useAuthStore';
import { StaticTheme } from '@/theme';
import { Role } from '@/types/user';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// TODO: Should add name when sign up
const LoginScreen = () => {
  const { t } = useTranslation('login');
  const getStackScreenOptions = useStackScreenOptionsHelper();

  const theme = useAppTheme();
  const styles = getStyles(theme);

  const anonymousId = useAuthStore((s) => s.anonymousId);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isEmailValid, setIsEmailValid] = useState<null | boolean>(null);
  const [isPasswordValid, setIsPasswordValid] = useState<null | boolean>(null);
  const [error, setError] = useState('');

  const router = useRouter();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleEmailChange = useCallback((text: string) => {
    setError('');
    setEmail(text);
    setIsEmailValid(emailRegex.test(text));
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setError('');
    setPassword(text);
    const hasLetter = /[a-zA-Z]/.test(text);
    const hasNumber = /\d/.test(text);
    const hasMinLength = text.length >= 8;
    setIsPasswordValid(hasLetter && hasNumber && hasMinLength);
  }, []);

  const handleLogin = useCallback(async () => {
    setError('');
    await loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.replace('/(tabs)');
        },
        onError: () => {
          setError(
            t(
              "Sorry, we couldn't find an account with that email and password. Please double-check and try again.",
            ),
          );
        },
      },
    );
  }, [email, loginMutation, password, router, t]);

  const handleSignUp = useCallback(async () => {
    if (!anonymousId) {
      if (__DEV__) console.error('Anonymous ID is not found');
      return;
    }

    setError('');
    await registerMutation.mutate(
      { id: anonymousId, email, password, role: Role.CARERECEIVER },
      {
        onSuccess: () => {
          router.replace({
            pathname: ROUTES.ROLE_SELECTION,
            params: { from: 'signup' },
          });
        },
        onError: (e) => {
          if (isAxiosError(e) && e.response?.data?.detail?.includes('Email already registered')) {
            setError(t('This email is already registered.'));
          } else {
            setError(t('Registration failed. Please check your information and try again.'));
          }
        },
      },
    );
  }, [anonymousId, registerMutation, email, password, router, t]);

  const errorMessage = useMemo(() => {
    if (isEmailValid === false) return t('Please enter a valid email address');
    if (isPasswordValid === false)
      return t('Password must be at least 8 characters with letters and numbers');
    return error;
  }, [isEmailValid, t, isPasswordValid, error]);

  const isValidToSubmit = isEmailValid && isPasswordValid;

  return (
    <Fragment>
      <Stack.Screen options={getStackScreenOptions({ title: ROUTES.LOGIN })} />
      <ThemedView style={styles.root}>
        <Image
          // eslint-disable-next-line i18next/no-literal-string
          source={require('@/assets/images/splash-icon.png')}
          style={imageStyle.logo}
          resizeMode="contain"
        />
        {errorMessage ? (
          <ThemedView style={styles.errorContainer}>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </ThemedView>
        ) : null}
        <TextInput
          mode="outlined"
          label={t('Email')}
          keyboardType="email-address"
          value={email}
          onChangeText={handleEmailChange}
          error={isEmailValid === false}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label={t('Password')}
          textContentType="password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          error={isPasswordValid === false}
          style={styles.input}
        />
        <ThemedButton
          disabled={!isValidToSubmit || loginMutation.isPending || registerMutation.isPending}
          onPress={handleLogin}
          loading={loginMutation.isPending}
          style={[styles.button, styles.loginButton]}
        >
          {t('Login')}
        </ThemedButton>
        <ThemedButton
          disabled={!isValidToSubmit || loginMutation.isPending || registerMutation.isPending}
          onPress={handleSignUp}
          loading={registerMutation.isPending}
          mode="outlined"
          style={styles.button}
        >
          {t('Sign up')}
        </ThemedButton>
      </ThemedView>
    </Fragment>
  );
};

const imageStyle = StyleSheet.create({
  logo: {
    height: 200,
    marginTop: -200,
    width: 200,
  },
});

const getStyles = createStyles<
  StyleRecord<'root' | 'button' | 'loginButton' | 'errorContainer', 'errorMessage' | 'input'>
>({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: StaticTheme.spacing.lg,
    gap: StaticTheme.spacing.md,
  },
  input: {
    width: '100%',
    marginTop: -6,
  },
  button: {
    width: '100%',
  },
  loginButton: {
    marginTop: StaticTheme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: (theme) => theme.colors.errorContainer,
    padding: StaticTheme.spacing.md,
    borderRadius: StaticTheme.borderRadius.s,
    width: '100%',
  },
  errorMessage: {
    color: (theme) => theme.colors.onErrorContainer,
  },
});

export default LoginScreen;
