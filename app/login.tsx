import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CITIES,
  TRIBES,
  type CityId,
} from '@/constants/world';
import { WA } from '@/constants/whatsappTheme';
import { BRAND } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';
import { useIdentity } from '@/context/IdentityContext';
import { useIRC } from '@/context/IRCContext';

type Step = 'terms' | 'phone' | 'otp' | 'profile' | 'setup' | 'sync';

const MODEM = [
  'Conectando a Libera Chat…',
  'Sincronizando salas mIRC…',
  'Cargando arcade Lulula…',
  'LISTO ✓',
];

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone, requestOtp, verifyOtp, completeProfile, authDone, phoneVerified, smsMode, ready } = useAuth();
  const { setIdentity, onboardingDone } = useIdentity();
  const { connect, connectionState } = useIRC();

  const [step, setStep] = useState<Step>('terms');
  const [phoneInput, setPhoneInput] = useState(phone || '');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState<CityId | null>(null);
  const [tribeId, setTribeId] = useState<string | null>(null);
  const [modemLine, setModemLine] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devCodeHint, setDevCodeHint] = useState('');
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (authDone && !onboardingDone) {
      setStep('setup');
    } else if (phoneVerified && !authDone) {
      setStep('profile');
    } else if (phone && !phoneVerified) {
      setStep('otp');
      if (phone.startsWith('+52')) setPhoneInput(phone.slice(3));
    }
  }, [ready, authDone, onboardingDone, phoneVerified, phone]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (authDone && onboardingDone) {
      router.replace('/(tabs)/chats');
    }
  }, [authDone, onboardingDone, router]);

  useEffect(() => {
    if (step !== 'sync') return;
    if (modemLine >= MODEM.length - 1 && connectionState === 'connected') {
      router.replace('/(tabs)/chats');
      return;
    }
    if (modemLine >= MODEM.length - 1) return;
    const t = setTimeout(() => setModemLine((n) => n + 1), 800);
    return () => clearTimeout(t);
  }, [step, modemLine, connectionState, router]);

  const countryCode = '+52';

  const submitPhone = async () => {
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length < 10) return;
    setLoading(true);
    setOtpError('');
    const result = await requestOtp(`${countryCode}${digits}`);
    setLoading(false);
    if (!result.ok) {
      setOtpError(result.error || 'No se pudo enviar el SMS');
      if (result.retryAfter) setResendIn(result.retryAfter);
      return;
    }
    if (result.devCode) setDevCodeHint(result.devCode);
    setResendIn(60);
    setStep('otp');
  };

  const resendOtp = async () => {
    if (resendIn > 0 || loading) return;
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length < 10) return;
    setLoading(true);
    setOtpError('');
    const result = await requestOtp(`${countryCode}${digits}`);
    setLoading(false);
    if (!result.ok) {
      setOtpError(result.error || 'No se pudo reenviar');
      if (result.retryAfter) setResendIn(result.retryAfter);
      return;
    }
    if (result.devCode) setDevCodeHint(result.devCode);
    setResendIn(60);
  };

  const submitOtp = async () => {
    setLoading(true);
    setOtpError('');
    const result = await verifyOtp(otp);
    setLoading(false);
    if (!result.ok) {
      setOtpError(result.error || 'Código inválido');
      return;
    }
    setDevCodeHint('');
    setStep('profile');
  };

  const submitProfile = async () => {
    if (name.trim().length < 2) return;
    await completeProfile(name.trim());
    setStep('setup');
  };

  const finishSetup = async () => {
    if (!cityId || !tribeId) return;
    await setIdentity(cityId, tribeId);
    setStep('sync');
    setModemLine(0);
    connect(name.trim().replace(/\s+/g, '_').slice(0, 16));
  };

  const content = useMemo(() => {
    switch (step) {
      case 'terms':
        return (
          <>
            <Image source={require('@/assets/images/lulula-mascot.png')} style={styles.heroImg} />
            <Text style={styles.waTitle}>{BRAND.name}</Text>
            <Text style={styles.waSub}>Lee nuestra Política de privacidad y Términos de servicio.</Text>
            <Text style={styles.waLegal}>
              Toca "Aceptar y continuar" para aceptar los Términos de servicio y la Política de privacidad de{' '}
              {BRAND.name}.
            </Text>
            <Pressable style={styles.waPrimary} onPress={() => setStep('phone')}>
              <Text style={styles.waPrimaryText}>Aceptar y continuar</Text>
            </Pressable>
          </>
        );
      case 'phone':
        return (
          <>
            <Text style={styles.stepTitle}>Introduce tu número de teléfono</Text>
            <Text style={styles.stepSub}>
              {BRAND.name} necesita verificar tu número. Después entras como en WhatsApp — a tu lista de chats.
            </Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryBox}>
                <Text style={styles.countryText}>{countryCode}</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                keyboardType="phone-pad"
                placeholder="número de teléfono"
                placeholderTextColor={WA.textSecondary}
                value={phoneInput}
                onChangeText={setPhoneInput}
                maxLength={15}
              />
            </View>
            <Pressable style={[styles.waPrimary, loading && styles.disabled]} onPress={submitPhone} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.waPrimaryText}>Siguiente</Text>}
            </Pressable>
          </>
        );
      case 'otp':
        return (
          <>
            <Text style={styles.stepTitle}>Verificación</Text>
            <Text style={styles.stepSub}>
              Enviamos un SMS a {phone || `${countryCode}${phoneInput}`}.
              {smsMode === 'twilio' ? '\nRevisa tus mensajes.' : '\nModo dev: mira la consola del servidor.'}
            </Text>
            {devCodeHint ? (
              <Text style={styles.devHint}>🔧 Dev OTP: {devCodeHint}</Text>
            ) : null}
            <TextInput
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              placeholder="------"
              placeholderTextColor={WA.textSecondary}
            />
            {otpError ? <Text style={styles.error}>{otpError}</Text> : null}
            <Pressable style={[styles.waPrimary, loading && styles.disabled]} onPress={submitOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.waPrimaryText}>Verificar</Text>}
            </Pressable>
            <Pressable onPress={resendOtp} disabled={resendIn > 0 || loading}>
              <Text style={[styles.resend, (resendIn > 0 || loading) && styles.resendDisabled]}>
                {resendIn > 0 ? `Reenviar código (${resendIn}s)` : 'Reenviar código'}
              </Text>
            </Pressable>
          </>
        );
      case 'profile':
        return (
          <>
            <Text style={styles.stepTitle}>Información del perfil</Text>
            <Text style={styles.stepSub}>Escribe tu nombre y una foto de perfil (Lulula por defecto).</Text>
            <Image source={require('@/assets/images/lulula-mascot.png')} style={styles.profileImg} />
            <TextInput
              style={styles.nameInput}
              placeholder="Nombre"
              placeholderTextColor={WA.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={24}
            />
            <Pressable style={styles.waPrimary} onPress={submitProfile}>
              <Text style={styles.waPrimaryText}>Siguiente</Text>
            </Pressable>
          </>
        );
      case 'setup':
        return (
          <>
            <Text style={styles.stepTitle}>Tu zona en el wire</Text>
            <Text style={styles.stepSub}>Ciudad + tribu = salas y juegos virales.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {CITIES.slice(0, 6).map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.chip, cityId === c.id && styles.chipOn]}
                  onPress={() => setCityId(c.id)}>
                  <Text style={styles.chipText}>{c.emoji} {c.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.tribeGrid}>
              {TRIBES.slice(0, 6).map((t) => (
                <Pressable
                  key={t.id}
                  style={[styles.tribeChip, tribeId === t.id && styles.chipOn]}
                  onPress={() => setTribeId(t.id)}>
                  <Text style={styles.chipText}>{t.emoji} {t.name}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.waPrimary, (!cityId || !tribeId) && styles.disabled]}
              onPress={finishSetup}
              disabled={!cityId || !tribeId}>
              <Text style={styles.waPrimaryText}>Entrar a Lulula</Text>
            </Pressable>
          </>
        );
      case 'sync':
        return (
          <View style={styles.modemBox}>
            {MODEM.slice(0, modemLine + 1).map((line, i) => (
              <Text key={i} style={styles.modemLine}>{'> '}{line}</Text>
            ))}
            <ActivityIndicator color={WA.teal} style={{ marginTop: 16 }} />
            <Text style={styles.modemHint}>Capa mIRC cargando detrás de WhatsApp…</Text>
          </View>
        );
    }
  }, [step, phoneInput, otp, name, cityId, tribeId, otpError, modemLine, countryCode, phone, smsMode, devCodeHint, loading, resendIn]);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {content}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WA.bg },
  scroll: { paddingHorizontal: 24, paddingBottom: 32, alignItems: 'stretch', gap: 16 },
  heroImg: { width: 120, height: 120, borderRadius: 28, alignSelf: 'center' },
  waTitle: { fontSize: 28, fontWeight: '700', color: WA.text, textAlign: 'center' },
  waSub: { fontSize: 15, color: WA.textSecondary, textAlign: 'center', lineHeight: 22 },
  waLegal: { fontSize: 13, color: WA.textSecondary, textAlign: 'center', lineHeight: 20, marginVertical: 8 },
  waPrimary: {
    backgroundColor: WA.green,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 12,
  },
  waPrimaryText: { fontSize: 17, fontWeight: '600', color: '#fff' },
  disabled: { opacity: 0.45 },
  stepTitle: { fontSize: 24, fontWeight: '700', color: WA.text, marginTop: 8 },
  stepSub: { fontSize: 15, color: WA.textSecondary, lineHeight: 22 },
  phoneRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  countryBox: {
    backgroundColor: WA.inputBg,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8,
  },
  countryText: { fontSize: 16, color: WA.text },
  phoneInput: {
    flex: 1,
    backgroundColor: WA.inputBg,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: WA.text,
  },
  otpInput: {
    backgroundColor: WA.inputBg,
    borderRadius: 8,
    padding: 16,
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    color: WA.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  error: { color: WA.danger, fontSize: 13 },
  devHint: {
    fontSize: 14,
    fontFamily: 'Courier',
    color: WA.teal,
    textAlign: 'center',
    backgroundColor: WA.inputBg,
    padding: 10,
    borderRadius: 8,
  },
  resend: { fontSize: 14, color: WA.link, textAlign: 'center', marginTop: 12 },
  resendDisabled: { color: WA.textSecondary },
  profileImg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: WA.green,
  },
  nameInput: {
    backgroundColor: WA.inputBg,
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    color: WA.text,
  },
  chipScroll: { maxHeight: 48 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: WA.inputBg,
    borderRadius: 20,
    marginRight: 8,
  },
  chipOn: { backgroundColor: WA.green + '44', borderWidth: 1, borderColor: WA.green },
  chipText: { color: WA.text, fontSize: 13 },
  tribeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tribeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: WA.inputBg,
    borderRadius: 12,
  },
  modemBox: {
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: WA.teal,
    padding: 20,
    minHeight: 200,
    marginTop: 24,
  },
  modemLine: { fontFamily: 'Courier', fontSize: 13, color: WA.teal, marginBottom: 6 },
  modemHint: { fontSize: 12, color: WA.textSecondary, marginTop: 12, textAlign: 'center' },
});
