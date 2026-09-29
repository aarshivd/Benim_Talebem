import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, BackHandler, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/theme';
import { Screen, Text, Button, Input, PinPad, IconButton } from '@/components/ui';
import { setPin } from '@/lib/pin';
import { useSession } from '@/store/session';

export default function SetupScreen() {
  const { colors, spacing } = useTheme();
  const completeSetup = useSession(s => s.completeSetup);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Welcome, 2: Name, 3: PIN, 4: Confirm PIN
  const [name, setName] = useState('');
  const [pin, setPinState] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  // Kurulum sırasında geri tuşunu engelle (Android)
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (step > 1) {
          setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
          return true;
        }
        BackHandler.exitApp();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [step])
  );

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (name.trim().length < 2) {
        setError('Lütfen geçerli bir isim girin.');
        return;
      }
      setError('');
      setStep(3);
    } else if (step === 3) {
      if (pin.length < 4) {
        setError('PIN en az 4 haneli olmalıdır.');
        return;
      }
      setError('');
      setStep(4);
    } else if (step === 4) {
      if (pin !== confirmPin) {
        setError('PIN\'ler eşleşmiyor. Lütfen tekrar deneyin.');
        setPinState('');
        setConfirmPin('');
        setStep(3);
        return;
      }
      try {
        await setPin(pin);
        await completeSetup(name.trim());
      } catch (e: any) {
        setError(e.message || 'Bir hata oluştu.');
      }
    }
  };

  const handlePinPress = (key: string) => {
    if (step === 3) {
      if (pin.length < 6) setPinState(p => p + key);
    } else if (step === 4) {
      if (confirmPin.length < 6) setConfirmPin(p => p + key);
    }
    setError('');
  };

  const handlePinDelete = () => {
    if (step === 3) {
      setPinState(p => p.slice(0, -1));
    } else if (step === 4) {
      setConfirmPin(p => p.slice(0, -1));
    }
  };

  const renderDots = (value: string) => {
    return (
      <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginVertical: 24 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const isFilled = i < value.length;
          return (
            <View
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: isFilled ? colors.primary : colors.border,
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Screen>
      {step > 1 && (
        <View style={styles.header}>
          <IconButton
            icon="arrow-back"
            onPress={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
            accessibilityLabel="Geri"
            color={colors.ink}
          />
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { padding: spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text variant="display" style={{ fontSize: 64, marginBottom: 24, textAlign: 'center' }}>
                🌟
              </Text>
              <Text variant="heading" align="center" style={{ marginBottom: 12 }}>
                Okuma Yıldızı&apos;na Hoş Geldiniz!
              </Text>
              <Text variant="body" color={colors.muted} align="center" style={{ marginBottom: 48 }}>
                Talebelerinizin okuma takibini kolayca yapın, onlara puanlar ve ödüller verin. Her şey cihazınızda güvenle saklanır.
              </Text>
              <Button label="Hadi Başlayalım" onPress={handleNext} />
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text variant="heading" align="center" style={{ marginBottom: 12 }}>
                Size Nasıl Hitap Edelim?
              </Text>
              <Text variant="body" color={colors.muted} align="center" style={{ marginBottom: 32 }}>
                Talebelerinize bu isimle görüneceksiniz.
              </Text>
              <Input
                value={name}
                onChangeText={(t) => { setName(t); setError(''); }}
                placeholder="Örn: Ali Hoca"
                error={error}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={handleNext}
              />
              <View style={{ marginTop: 24, width: '100%' }}>
                <Button label="İleri" onPress={handleNext} />
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text variant="heading" align="center" style={{ marginBottom: 12 }}>
                Uygulama PIN Kodu
              </Text>
              <Text variant="body" color={colors.muted} align="center" style={{ marginBottom: 12 }}>
                Uygulamaya sadece sizin erişebilmeniz için 4-6 haneli bir PIN belirleyin.
              </Text>
              
              {renderDots(pin)}
              
              {!!error && (
                <Text variant="caption" color={colors.danger} align="center" style={{ marginBottom: 16 }}>
                  {error}
                </Text>
              )}

              <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end', paddingBottom: 24 }}>
                <PinPad onKeyPress={handlePinPress} onDelete={handlePinDelete} />
                <View style={{ marginTop: 24 }}>
                  <Button 
                    label="İleri" 
                    onPress={handleNext} 
                    disabled={pin.length < 4}
                  />
                </View>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text variant="heading" align="center" style={{ marginBottom: 12 }}>
                PIN Kodunu Doğrulayın
              </Text>
              <Text variant="body" color={colors.muted} align="center" style={{ marginBottom: 12 }}>
                Lütfen belirlediğiniz PIN kodunu tekrar girin.
              </Text>
              
              {renderDots(confirmPin)}

              {!!error && (
                <Text variant="caption" color={colors.danger} align="center" style={{ marginBottom: 16 }}>
                  {error}
                </Text>
              )}

              <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end', paddingBottom: 24 }}>
                <PinPad onKeyPress={handlePinPress} onDelete={handlePinDelete} />
                <View style={{ marginTop: 24 }}>
                  <Button 
                    label="Tamamla" 
                    onPress={handleNext} 
                    disabled={confirmPin.length < 4}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  content: {
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
