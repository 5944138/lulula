import { Redirect } from 'expo-router';

/** Legacy route — redirige al login estilo WhatsApp */
export default function ConnectRedirect() {
  return <Redirect href="/login" />;
}
