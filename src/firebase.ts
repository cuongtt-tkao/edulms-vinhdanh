import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

/**
 * Email quản trị viên khởi tạo (khớp với hàm isBootstrapAdmin() trong firestore.rules).
 * Khi email này đăng nhập (đã xác thực), tài khoản được cấp quyền ADMIN.
 */
export const BOOTSTRAP_ADMIN_EMAILS: string[] = ['cuongtt.tkao@gmail.com', 'hanhchinh.na@gmail.com'];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Cơ sở dữ liệu Firestore.
 * Mặc định dùng database "(default)" (nằm trong hạn mức miễn phí của gói Spark).
 * Nếu muốn dùng database có tên riêng, đặt biến môi trường VITE_FIRESTORE_DATABASE_ID trên Vercel.
 *
 * Bộ nhớ đệm IndexedDB giúp tiết kiệm lượt đọc (mở lại web không phải tải lại toàn bộ dữ liệu).
 */
const databaseId: string =
  ((import.meta as any).env?.VITE_FIRESTORE_DATABASE_ID as string | undefined) || '(default)';

export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  },
  databaseId
);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** Đăng nhập bằng Google (Firebase Auth) */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/** Đăng nhập bằng email + mật khẩu */
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

/** Đăng ký bằng email + mật khẩu, gửi thư xác thực email thật */
export async function registerWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  try {
    await sendEmailVerification(cred.user);
  } catch (e) {
    console.warn('Không gửi được thư xác thực email:', e);
  }
  return cred.user;
}

/** Gửi thư đặt lại mật khẩu */
export async function sendResetPasswordEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/** Đổi mật khẩu của tài khoản đang đăng nhập (chỉ tài khoản đăng ký bằng email/mật khẩu) */
export async function changeCurrentPassword(newPassword: string): Promise<'OK' | 'NO_PASSWORD_PROVIDER'> {
  const user = auth.currentUser;
  if (!user) throw new Error('Chưa đăng nhập.');
  const hasPassword = user.providerData.some((p) => p.providerId === 'password');
  if (!hasPassword) return 'NO_PASSWORD_PROVIDER';
  await updatePassword(user, newPassword);
  return 'OK';
}

/** Đăng xuất */
export async function logOutFirebase(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };

/** Chuyển mã lỗi Firebase Auth sang tiếng Việt */
export function describeAuthError(err: any): string {
  const code: string = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Email hoặc mật khẩu không đúng.';
    case 'auth/email-already-in-use':
      return 'Email này đã có tài khoản. Hãy đăng nhập (hoặc dùng "Quên mật khẩu").';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
    case 'auth/too-many-requests':
      return 'Thử quá nhiều lần. Vui lòng đợi một lúc rồi thử lại.';
    case 'auth/network-request-failed':
      return 'Mất kết nối mạng. Vui lòng kiểm tra Internet.';
    case 'auth/operation-not-allowed':
      return 'Chưa bật phương thức đăng nhập này trong Firebase Console (Authentication > Sign-in method).';
    case 'auth/unauthorized-domain':
      return 'Tên miền web chưa được thêm vào Firebase (Authentication > Settings > Authorized domains).';
    case 'auth/popup-closed-by-user':
      return 'Cửa sổ đăng nhập đã được đóng trước khi hoàn tất.';
    case 'auth/requires-recent-login':
      return 'Vì lý do bảo mật, hãy đăng xuất, đăng nhập lại rồi thực hiện lại thao tác này.';
    default:
      return err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }
}
