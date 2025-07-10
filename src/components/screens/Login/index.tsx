import { Stack, useRouter } from 'expo-router';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet } from 'react-native';

import { Text, TextInput } from 'react-native-paper';

import { useLogin } from '@/api/auth';
import useAppTheme from '@/hooks/useAppTheme';
import { StaticTheme } from '@/theme';
import { createStyles, type StyleRecord } from '@/utils/createStyles';

import ThemedButton from '@/components/atoms/ThemedButton';
import ThemedView from '@/components/atoms/ThemedView';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen = () => {
  const { t } = useTranslation('login');
  const { t: tCommon } = useTranslation('common');
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();
  const loginMutation = useLogin();

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
              'Sorry, we couldn’t find an account with that email and password. Please double-check and try again.',
            ),
          );
        },
      },
    );
  }, [email, loginMutation, password, router, t]);

  const handleSignUp = useCallback(() => {
    // TODO: Implement sign up
  }, []);

  useEffect(() => {
    setError('');
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  useEffect(() => {
    setError('');
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 8;
    setIsPasswordValid(hasLetter && hasNumber && hasMinLength);
  }, [password]);

  const errorMessage = useMemo(() => {
    if (!isEmailValid) return t('Please enter a valid email address');
    if (!isPasswordValid)
      return t('Password must be at least 8 characters with letters and numbers');
    return error;
  }, [isEmailValid, isPasswordValid, error, t]);

  const isValidToSubmit = isEmailValid && isPasswordValid;

  return (
    <Fragment>
      <Stack.Screen
        options={{
          title: t('Login'),
          headerBackTitle: tCommon('Settings'),
        }}
      />
      <ThemedView style={styles.root}>
        <Image
          // eslint-disable-next-line i18next/no-literal-string
          source={require('@/assets/images/icon.png')}
          style={imageStyle.logo}
          resizeMode="contain"
        />
        {!isValidToSubmit || error ? (
          <ThemedView style={styles.errorContainer}>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          </ThemedView>
        ) : null}
        <TextInput
          mode="outlined"
          label={t('Email')}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={!isEmailValid}
          style={styles.input}
        />
        <TextInput
          mode="outlined"
          label={t('Password')}
          textContentType="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={!isPasswordValid}
          style={styles.input}
        />
        <ThemedButton
          disabled={!isValidToSubmit}
          onPress={handleLogin}
          loading={loginMutation.isPending}
          style={[styles.button, styles.loginButton]}
        >
          {t('Login')}
        </ThemedButton>
        <ThemedButton
          disabled={!isValidToSubmit}
          onPress={handleSignUp}
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
    height: 140,
    marginTop: -140,
    width: 140,
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
