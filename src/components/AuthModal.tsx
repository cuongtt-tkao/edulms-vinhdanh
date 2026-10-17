import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Shield,
  User,
  Building2,
  MapPin,
  Users2,
  KeyRound,
  Mail,
  CheckCircle2,
  Send,
  Inbox,
  Sparkles,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { UserAccount, Company, Area, Department } from '../types/edulms';
import { signInWithGoogle } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: UserAccount[];
  companies: Company[];
  areas: Area[];
  departments: Department[];
  onLogin: (account: UserAccount) => void;
  onGoogleSuccess: (user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  }) => void;
  onRegister: (data: {
    fullName: string;
    username: string;
    email: string;
    password?: string;
    companyCode: string;
    areaCode: string;
    departmentCode: string;
    emailVerified?: boolean;
  }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  accounts,
  companies,
  areas,
  departments,
  onLogin,
  onGoogleSuccess,
  onRegister,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'EMAIL_PREVIEW' | 'FORGOT_PASS'>('LOGIN');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('123456');
  const [sendToGmail, setSendToGmail] = useState(true);
  const [regCompany, setRegCompany] = useState(companies[0]?.code || 'Th1');
  const [regArea, setRegArea] = useState('1.1');
  const [regDept, setRegDept] = useState(departments[0]?.code || 'Thanh Niên Nam');

  // Sent Email Simulation State
  const [dispatchedEmailData, setDispatchedEmailData] = useState<{
    toEmail: string;
    fullName: string;
    username: string;
    password: string;
    otpCode: string;
  } | null>(null);

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  if (!isOpen) return null;

  // Handle Google Sign-in with Firebase
  const handleGoogleSignInClick = async () => {
    try {
      setIsGoogleLoading(true);
      setAuthError('');
      const user = await signInWithGoogle();
      onGoogleSuccess({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      });
      onClose();
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Cửa sổ đăng nhập đã được đóng trước khi hoàn tất.');
      } else {
        setAuthError(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const query = loginIdentifier.trim().toLowerCase();
    const found = accounts.find(
      (a) => a.username.toLowerCase() === query || a.email.toLowerCase() === query
    );

    if (found) {
      onLogin(found);
      onClose();
    } else {
      setAuthError('Không tìm thấy tài khoản với tên đăng nhập hoặc email này.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!regFullName.trim()) {
      setAuthError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!regUsername.trim()) {
      setAuthError('Vui lòng nhập tên đăng nhập.');
      return;
    }
    if (!regEmail.trim()) {
      setAuthError('Vui lòng nhập địa chỉ Gmail để nhận thông tin đăng nhập.');
      return;
    }

    const usernameQuery = regUsername.trim().toLowerCase();
    const exists = accounts.some(
      (a) => a.username.toLowerCase() === usernameQuery
    );
    if (exists) {
      setAuthError('Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.');
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const effectivePass = regPassword.trim() || '123456';

    setDispatchedEmailData({
      toEmail: regEmail.trim(),
      fullName: regFullName.trim(),
      username: usernameQuery,
      password: effectivePass,
      otpCode,
    });

    if (sendToGmail) {
      setMode('EMAIL_PREVIEW');
    } else {
      onRegister({
        fullName: regFullName.trim(),
        username: usernameQuery,
        email: regEmail.trim(),
        password: effectivePass,
        companyCode: regCompany,
        areaCode: regArea,
        departmentCode: regDept,
        emailVerified: true,
      });
      onClose();
    }
  };

  const handleConfirmEmailAndLogin = () => {
    if (!dispatchedEmailData) return;

    onRegister({
      fullName: dispatchedEmailData.fullName,
      username: dispatchedEmailData.username,
      email: dispatchedEmailData.toEmail,
      password: dispatchedEmailData.password,
      companyCode: regCompany,
      areaCode: regArea,
      departmentCode: regDept,
      emailVerified: true,
    });

    onClose();
  };

  const handleQuickLogin = (account: UserAccount) => {
    onLogin(account);
    onClose();
  };

  const handleForgotPassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = forgotEmail.trim().toLowerCase();
    const found = accounts.find((a) => a.email.toLowerCase() === query || a.username.toLowerCase() === query);

    if (found) {
      setDispatchedEmailData({
        toEmail: found.email,
        fullName: found.fullName,
        username: found.username,
        password: found.password || '123456',
        otpCode: Math.floor(100000 + Math.random() * 900000).toString(),
      });
      setMode('EMAIL_PREVIEW');
    } else {
      setForgotMessage('Không tìm thấy tài khoản với địa chỉ email này trong hệ thống.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-7 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        {mode !== 'EMAIL_PREVIEW' && (
          <div className="flex border-b border-slate-100 pb-3 mb-5">
            <button
              onClick={() => {
                setMode('LOGIN');
                setAuthError('');
              }}
              className={`flex items-center gap-2 pb-2 px-3 text-sm font-bold border-b-2 transition cursor-pointer ${
                mode === 'LOGIN'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>

            <button
              onClick={() => {
                setMode('REGISTER');
                setAuthError('');
              }}
              className={`flex items-center gap-2 pb-2 px-3 text-sm font-bold border-b-2 transition cursor-pointer ${
                mode === 'REGISTER'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng ký</span>
            </button>
          </div>
        )}

        {/* Error notification */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {authError}
          </div>
        )}

        {/* OFFICIAL FIREBASE GOOGLE SIGN-IN BUTTON (Appears in both Login & Register) */}
        {mode !== 'EMAIL_PREVIEW' && mode !== 'FORGOT_PASS' && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignInClick}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-300 shadow-sm transition flex items-center justify-center gap-2.5 cursor-pointer hover:border-slate-400"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Đăng nhập nhanh với Google (Firebase Auth)</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-3 text-[11px] text-slate-400 font-semibold uppercase">Hoặc</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>
          </div>
        )}

        {/* VIEW 1: EMAIL DISPATCH NOTIFICATION (SIMULATION MODAL) */}
        {mode === 'EMAIL_PREVIEW' && dispatchedEmailData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Hộp thư Gmail xác thực tài khoản
                </h3>
                <p className="text-[11px] text-slate-500">
                  Đã gửi thông tin đến: <strong>{dispatchedEmailData.toEmail}</strong>
                </p>
              </div>
            </div>

            {/* Email Letter Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 font-sans">
              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 border-b border-slate-200">
                <span>Người gửi: <strong>EduLMS &lt;noreply@edulms.vn&gt;</strong></span>
                <span className="text-emerald-600 font-bold">✓ Đã gửi thành công</span>
              </div>

              <div>
                <div className="font-extrabold text-slate-900 text-sm mb-1">
                  [EduLMS] Xác thực tài khoản thi đua & Thông tin đăng nhập
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Kính chào <strong>{dispatchedEmailData.fullName}</strong>, <br />
                  Cảm ơn bạn đã tham gia Lễ hội thi đua Truyền Đạo. Dưới đây là thông tin tài khoản của bạn:
                </p>
              </div>

              {/* Login Info Card */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div>• Tên đăng nhập: <strong>{dispatchedEmailData.username}</strong></div>
                <div>• Mật khẩu đăng nhập: <strong className="text-blue-700">{dispatchedEmailData.password}</strong></div>
                <div>• Mã OTP kích hoạt: <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-black rounded">{dispatchedEmailData.otpCode}</span></div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Tài khoản của bạn đã được kiểm tra và kích hoạt sẵn sàng tham gia ghi nhận thi đua.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleConfirmEmailAndLogin}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác nhận & Đăng nhập ngay vào hệ thống</span>
              </button>

              <button
                onClick={() => setMode('LOGIN')}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Quay lại màn hình đăng nhập
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: LOGIN FORM */}
        {mode === 'LOGIN' && (
          <div>
            <div className="mb-4">
              <h3 className="text-base font-black text-slate-900">Đăng nhập tài khoản</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập tên đăng nhập hoặc email của bạn để tiếp tục.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email hoặc Tên đăng nhập *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="nguyenvanan hoặc an.nguyen@edulms.vn"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('FORGOT_PASS');
                      setForgotMessage('');
                    }}
                    className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            </form>

            {/* Production Security Assurance */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Hệ thống bảo mật Firebase Authentication. Tài khoản Ban Quản Trị chỉ kích hoạt cho email được phân quyền chính thức.</span>
            </div>
          </div>
        )}

        {/* VIEW 3: REGISTER FORM */}
        {mode === 'REGISTER' && (
          <div>
            <div className="mb-4">
              <h3 className="text-base font-black text-slate-900">Đăng ký tài khoản thi đua</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tạo tài khoản cá nhân hoặc kết nối với hòm thư Gmail của bạn.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên của bạn *
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Ví dụ: Lê Hoàng Minh"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="leminh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Gmail Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Địa chỉ Gmail nhận thông tin *</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Gửi Pass về Gmail</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tenban@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              {/* Checkbox option */}
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={sendToGmail}
                  onChange={(e) => setSendToGmail(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                />
                <span>Gửi thông tin tài khoản và mật khẩu về Gmail để xác thực</span>
              </label>

              {/* Units Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Công ty trực thuộc *
                </label>
                <select
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                >
                  {companies.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khu vực *
                  </label>
                  <input
                    type="text"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    placeholder="1.1, 1.2..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ban ngành *
                  </label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký & Xác thực Gmail</span>
              </button>
            </form>
          </div>
        )}

        {/* VIEW 4: FORGOT PASSWORD */}
        {mode === 'FORGOT_PASS' && (
          <div>
            <div className="mb-4">
              <h3 className="text-base font-black text-slate-900">Quên mật khẩu?</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập địa chỉ Gmail để nhận lại thông tin đăng nhập và mật khẩu qua thư điện tử.
              </p>
            </div>

            {forgotMessage && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-xl">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Gmail hoặc Tên đăng nhập
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="nguyenvanan hoặc an.nguyen@edulms.vn"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Gửi thư Gmail
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
