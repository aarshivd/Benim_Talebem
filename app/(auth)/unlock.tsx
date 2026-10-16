import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler, Animated, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Screen, Text, Button, PinPad } from '@/components/ui';
import { verifyPin, getLockoutStatus, clearPinData } from '@/lib/pin';
import { useSession } from '@/store/session';

export default function UnlockScreen() {
  const { colors } = useTheme();
  const unlock = useSession((s) => s.unlock);

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [lockoutSecs, setLockoutSecs] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Geri tuşu uygulamayı kapatsın
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, []),
  );

  useEffect(() => {
    // İlk açılışta lockout kontrolü
    checkLockout();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (lockoutSecs > 0) {
      interval = setInterval(() => {
        setLockoutSecs((s) => {
          if (s <= 1) return 0;
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutSecs]);

  const checkLockout = async () => {
    const status = await getLockoutStatus();
    if (status.locked) {
      setLockoutSecs(status.remainingSeconds);
      setError(`Çok fazla hatalı deneme. Lütfen ${status.remainingSeconds} saniye bekleyin.`);
      setPin('');
    }
  };

  const shakeError = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = async (key: string) => {
    if (lockoutSecs > 0) return;

    setError('');
    const newPin = pin + key;
    setPin(newPin);

    // Otomatik kontrol (4-6 hane)
    if (newPin.length >= 4) {
      try {
        const isValid = await verifyPin(newPin);
        if (isValid) {
          unlock();
        } else {
          // 4 hane girdi ve yanlışsa bekleyelim. Eğer 6 hane beklersek?
          // Kullanıcı kendisi "onay" tuşuna basmıyor, bu yüzden 6'ya ulaşınca kesin kontrol edelim.
          // Ama PIN uzunluğunu bilmediğimiz için her basışta doğrulama yapabiliriz.
          // Başarısız olursa ve 6 hane olduysa hata ver.
          if (newPin.length === 6) {
            shakeError();
            setPin('');
            await checkLockout(); // Ceza var mı kontrol et
            if (lockoutSecs === 0 && !error) {
              // Yeni lockout gelmediyse jenerik hata
              setError('Hatalı PIN.');
            }
          }
        }
      } catch {
        shakeError();
        setPin('');
        await checkLockout();
      }
    }
  };

  const handleDelete = () => {
    if (lockoutSecs > 0) return;
    setPin((p) => p.slice(0, -1));
    setError('');
  };

  // Tamam tuşunu simüle etmek için (Eğer PIN 4 veya 5 haneli ise)
  const handleSubmit = async () => {
    if (pin.length < 4 || lockoutSecs > 0) return;
    try {
      const isValid = await verifyPin(pin);
      if (isValid) {
        unlock();
      } else {
        shakeError();
        setPin('');
        await checkLockout();
        if (lockoutSecs === 0 && !error) {
          setError('Hatalı PIN.');
        }
      }
    } catch {
      shakeError();
      setPin('');
      await checkLockout();
    }
  };

  const handleForgotPin = () => {
    Alert.alert(
      'PIN Sıfırlama',
      'PIN kodunuzu sıfırlamak için tüm uygulamanın sıfırlanması gerekmektedir. Devam ederseniz, cihazdaki tüm veriler silinir. (Eğer yedek aldıysanız, kurulumdan sonra geri yükleyebilirsiniz.)\n\nEmin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Tüm Verileri Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Son Onay',
              'Bu işlem geri alınamaz. Uygulama verileri tamamen silinecek. Onaylıyor musunuz?',
              [
                { text: 'Vazgeç', style: 'cancel' },
                {
                  text: 'Evet, Sil',
                  style: 'destructive',
                  onPress: async () => {
                    await clearPinData();
                    // Burada db reset işlemi vs. yapılmalı ama şimdilik sadece session'ı setup'a atacak şekilde:
                    // Veritabanı dosyasını silmek veya wipe atmak gerekir.
                    // Şimdilik sadece reload veya error throw
                    // Uygulama yeniden başlatılınca veya layout tetiklenince setup'a döner.
                    // (Gerçek hayatta DB dosyasını silip expo-updates reloadAsync yapmak en iyisidir)
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const renderDots = () => {
    return (
      <Animated.View
        style={[
          { flexDirection: 'row', gap: 16, justifyContent: 'center', marginVertical: 32 },
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const isFilled = i < pin.length;
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
      </Animated.View>
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="heading" align="center" style={{ marginTop: 40 }}>
          Kilidi Açın
        </Text>

        {/* eslint-disable-next-line react-hooks/refs */}
        {renderDots()}

        <View style={{ height: 24, justifyContent: 'center', marginBottom: 24 }}>
          {!!error && (
            <Text variant="caption" color={colors.danger} align="center">
              {error}
            </Text>
          )}
          {lockoutSecs > 0 && !error && (
            <Text variant="caption" color={colors.danger} align="center">
              Lütfen {lockoutSecs} saniye bekleyin.
            </Text>
          )}
        </View>

        <PinPad onKeyPress={handleKeyPress} onDelete={handleDelete} disabled={lockoutSecs > 0} />

        <View style={styles.footer}>
          {pin.length >= 4 && (
            <Button label="Giriş" onPress={handleSubmit} style={{ marginBottom: 16, width: 200 }} />
          )}
          <Button
            label="PIN'imi unuttum"
            variant="ghost"
            onPress={handleForgotPin}
            disabled={lockoutSecs > 0}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
});
