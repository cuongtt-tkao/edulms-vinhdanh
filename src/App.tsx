import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { doc, onSnapshot, updateDoc, writeBatch, getDocFromServer } from 'firebase/firestore';
import {
  useCloudCollection,
  sortHuongKhiNewestFirst,
  seedStructure,
} from './data/cloudStore';
import {
  Company,
  Area,
  Department,
  Member,
  TargetRecord,
  TargetSteps,
  StepDates,
  MemberGoals,
  MemberResults,
  UserAccount,
  HuongKhiItem,
  ReactionType,
  ReactionCounts,
  HuongKhiComment,
} from './types/edulms';
import {
  calculateTargetScore,
  computeMemberScore,
  rankMembers,
  computeCompanyRankings,
  computeAreaRankings,
} from './utils/scoringEngine';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { KpiCards } from './components/KpiCards';
import { LeaderboardTable } from './components/LeaderboardTable';
import { PodiumTop3 } from './components/PodiumTop3';
import { RegionalStats } from './components/RegionalStats';
import { ResultEntrySection } from './components/ResultEntrySection';
import { AdminPanel } from './components/AdminPanel';
import { ProfilePage } from './components/ProfilePage';
import { AuthModal, RegistrationData } from './components/AuthModal';
import { DetailModal } from './components/DetailModal';
import { RegionalDetailModal } from './components/RegionalDetailModal';
import { RulesModal } from './components/RulesModal';
import { NewsSection } from './components/NewsSection';
import { Footer } from './components/Footer';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import {
  auth,
  db,
  onAuthStateChanged,
  FirebaseUser,
  logOutFirebase,
  registerWithEmail,
  changeCurrentPassword,
  describeAuthError,
  BOOTSTRAP_ADMIN_EMAILS,
} from './firebase';

export default function App() {
  // ---------- Đăng nhập (Firebase Authentication) ----------
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [profileState, setProfileState] = useState<'UNKNOWN' | 'READY' | 'MISSING'>('UNKNOWN');
  const pendingRegistrationRef = useRef<RegistrationData | null>(null);
  const creatingProfileRef = useRef<boolean>(false);
  const welcomedUidRef = useRef<string | null>(null);
  const signedIn = !!firebaseUser;

  // ---------- Dữ liệu dùng chung (Cloud Firestore, cập nhật thời gian thực) ----------
  const reportError = (msg: string) => showNotification(msg);
  const [companies, setCompanies, companiesLoaded] = useCloudCollection<Company>('companies', {
    enabled: signedIn,
    ordered: true,
    onError: reportError,
  });
  const [areas, setAreas] = useCloudCollection<Area>('areas', {
    enabled: signedIn,
    ordered: true,
    onError: reportError,
  });
  const [departments, setDepartments] = useCloudCollection<Department>('departments', {
    enabled: signedIn,
    ordered: true,
    onError: reportError,
  });
  const [members, setMembers] = useCloudCollection<Member>('members', {
    enabled: signedIn,
    onError: reportError,
  });
  const [huongKhiList, setHuongKhiList] = useCloudCollection<HuongKhiItem>('huongKhi', {
    enabled: signedIn,
    sort: sortHuongKhiNewestFirst,
    onError: reportError,
  });

  // Theme Dark/Light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edulms_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('edulms_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('edulms_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Main Page View Tabs: 'HONORS' | 'ENTRY' | 'PROFILE' | 'ADMIN'
  const [activeTab, setActiveTab] = useState<'HONORS' | 'ENTRY' | 'PROFILE' | 'ADMIN'>('HONORS');

  // Timers & Refresh
  const [countdown, setCountdown] = useState<number>(60);
  const [isAutoRefreshPaused, setIsAutoRefreshPaused] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('16/10/2026 10:30');
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isRegionalModalOpen, setIsRegionalModalOpen] = useState<boolean>(false);
  const [selectedAreaCode, setSelectedAreaCode] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Show Toast
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Re-rank members dynamically whenever members change
  const rankedMembers = useMemo(() => {
    return rankMembers(members);
  }, [members]);

  // Company Rankings (average score per active member)
  const companyRankings = useMemo(() => {
    return computeCompanyRankings(companies, rankedMembers);
  }, [companies, rankedMembers]);

  // Area Rankings (average score per active member)
  const areaRankings = useMemo(() => {
    return computeAreaRankings(areas, rankedMembers);
  }, [areas, rankedMembers]);

  // Current member data linked to logged-in user
  const currentMemberData = useMemo(() => {
    if (!currentUser) return null;
    return rankedMembers.find((m) => m.id === currentUser.memberId) || null;
  }, [currentUser, rankedMembers]);

  // Reaction của riêng người đang đăng nhập (dữ liệu dùng chung lưu theo từng tài khoản)
  const huongKhiView = useMemo<HuongKhiItem[]>(
    () =>
      huongKhiList.map((hk) => ({
        ...hk,
        userReaction: currentUser ? hk.userReactions?.[currentUser.id] : undefined,
      })),
    [huongKhiList, currentUser?.id]
  );

  // Personal Huong Khi list of current user
  const myHuongKhiList = useMemo(() => {
    if (!currentUser) return [];
    return huongKhiView.filter((h) => h.authorId === currentUser.memberId);
  }, [huongKhiView, currentUser]);

  // Dynamic KPI
  const kpiData = useMemo(() => {
    const activeMembers = rankedMembers.filter((m) => m.active);
    const totalTargets = activeMembers.reduce((acc, m) => acc + (m.targets?.length || 0), 0);
    const totalPoints = activeMembers.reduce((acc, m) => acc + (m.score || 0), 0);

    return {
      totalTeams: companies.length,
      totalMembers: activeMembers.length,
      totalTargets,
      totalPoints,
      lastUpdated,
    };
  }, [rankedMembers, companies, lastUpdated]);

  const getCurrentFormattedTime = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
  };

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setCountdown(60);
    setLastUpdated(getCurrentFormattedTime());
    showNotification('Đã cập nhật bảng xếp hạng thi đua thành công!');
  }, []);

  // 60-Second Auto-refresh timer
  useEffect(() => {
    if (isAutoRefreshPaused) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRefreshPaused, handleRefresh]);

  // ---------- Theo dõi trạng thái đăng nhập ----------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthReady(true);
      if (!u) {
        setCurrentUser(null);
        setProfileState('UNKNOWN');
        creatingProfileRef.current = false;
      }
    });
    return unsubscribe;
  }, []);

  // Đọc hồ sơ tài khoản (users/{uid}) theo thời gian thực
  useEffect(() => {
    if (!firebaseUser) return;
    const unsubscribe = onSnapshot(
      doc(db, 'users', firebaseUser.uid),
      (snap) => {
        if (snap.exists()) {
          setCurrentUser({ ...(snap.data() as Omit<UserAccount, 'id'>), id: snap.id });
          setProfileState('READY');
        } else if (!snap.metadata.fromCache) {
          // Máy chủ xác nhận chưa có hồ sơ -> sẽ tạo ở effect bên dưới
          setCurrentUser(null);
          setProfileState('MISSING');
        }
      },
      (err) => {
        console.error('[Firestore] Không đọc được hồ sơ:', err);
        showNotification(`Không đọc được hồ sơ tài khoản: ${err.message}`);
      }
    );
    return unsubscribe;
  }, [firebaseUser?.uid]);

  // Tạo hồ sơ + thành viên thi đua cho tài khoản mới (Google hoặc email/mật khẩu)
  useEffect(() => {
    if (!firebaseUser || profileState !== 'MISSING' || creatingProfileRef.current) return;
    creatingProfileRef.current = true;

    const createProfile = async () => {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const existing = await getDocFromServer(userRef);
      if (existing.exists()) return;

      const reg = pendingRegistrationRef.current;
      const email = (firebaseUser.email || reg?.email || '').trim();
      const fullName =
        reg?.fullName || firebaseUser.displayName || email.split('@')[0] || 'Thành viên mới';
      const companyCode = reg?.companyCode || companies[0]?.code || 'Th1';
      const areaCode =
        reg?.areaCode ||
        areas.find((a) => a.companyCode === companyCode)?.code ||
        areas[0]?.code ||
        '1.1';
      const departmentCode = reg?.departmentCode || departments[0]?.code || 'Thanh Niên Nam';
      const today = new Date().toISOString().split('T')[0];
      const memberId = `m-${firebaseUser.uid}`;
      const isAdminEmail =
        firebaseUser.emailVerified && BOOTSTRAP_ADMIN_EMAILS.includes(email.toLowerCase());

      const account = JSON.parse(
        JSON.stringify({
          username: reg?.username || email.split('@')[0] || `user_${Date.now()}`,
          email,
          fullName,
          role: isAdminEmail ? 'ADMIN' : 'MEMBER',
          memberId,
          companyCode,
          areaCode,
          departmentCode,
          avatarUrl: firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified,
          createdAt: today,
        })
      );

      const member = JSON.parse(
        JSON.stringify({
          code: `MEM-${firebaseUser.uid.slice(0, 6).toUpperCase()}`,
          fullName,
          companyCode,
          areaCode,
          departmentCode,
          active: true,
          score: 0,
          avatarUrl: firebaseUser.photoURL || undefined,
          goals: { s1: 10, s2: 8, s3: 5, s4: 4, s5: 4, s6: 2 },
          results: { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0 },
          targets: [],
          createdAt: today,
        })
      );

      const batch = writeBatch(db);
      batch.set(userRef, account);
      batch.set(doc(db, 'members', memberId), member);
      await batch.commit();

      pendingRegistrationRef.current = null;
      if (reg) {
        setActiveTab('PROFILE');
        showNotification(
          'Đăng ký thành công! Thư xác thực đã được gửi tới email của bạn (kiểm tra cả mục Spam).'
        );
      }
    };

    createProfile().catch((err) => {
      console.error('[Firestore] Không tạo được hồ sơ:', err);
      showNotification(`Không tạo được hồ sơ tài khoản: ${err.message}`);
      creatingProfileRef.current = false;
    });
  }, [firebaseUser, profileState]);

  // Lời chào khi đăng nhập
  useEffect(() => {
    if (currentUser && welcomedUidRef.current !== currentUser.id) {
      welcomedUidRef.current = currentUser.id;
      showNotification(`Xin chào, ${currentUser.fullName}!`);
    }
    if (!currentUser) welcomedUidRef.current = null;
  }, [currentUser?.id]);

  // Đồng bộ: cấp quyền ADMIN cho email quản trị khởi tạo; cập nhật trạng thái xác thực email
  useEffect(() => {
    if (!currentUser || !firebaseUser || currentUser.id !== firebaseUser.uid) return;
    const patch: Record<string, unknown> = {};
    const isAdminEmail =
      firebaseUser.emailVerified &&
      BOOTSTRAP_ADMIN_EMAILS.includes((firebaseUser.email || '').toLowerCase());
    if (isAdminEmail && currentUser.role !== 'ADMIN') patch.role = 'ADMIN';
    if (firebaseUser.emailVerified && !currentUser.emailVerified) patch.emailVerified = true;
    if (Object.keys(patch).length > 0) {
      updateDoc(doc(db, 'users', currentUser.id), patch).catch((err) =>
        console.warn('Không cập nhật được hồ sơ:', err)
      );
    }
  }, [currentUser?.role, currentUser?.emailVerified, firebaseUser?.emailVerified]);

  // ---------- Đăng ký / Đăng xuất ----------
  // Đăng ký bằng email + mật khẩu. Hồ sơ được tạo ở effect phía trên ngay khi tài khoản Firebase xuất hiện.
  const handleRegister = async (data: RegistrationData): Promise<void> => {
    pendingRegistrationRef.current = data;
    try {
      await registerWithEmail(data.email, data.password);
    } catch (err) {
      pendingRegistrationRef.current = null;
      throw err;
    }
  };

  const handleLogout = () => {
    logOutFirebase().catch((err) => console.warn('Firebase logout notice:', err));
    showNotification('Đã đăng xuất tài khoản.');
  };

  // Profile update handler (trả về true nếu lưu thành công)
  const handleUpdateProfile = async (updated: {
    fullName: string;
    avatarUrl?: string;
    coverUrl?: string;
    bio?: string;
    newPassword?: string;
    companyCode: string;
    areaCode: string;
    departmentCode: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;

    // Đổi mật khẩu (Firebase Auth)
    if (updated.newPassword) {
      try {
        const result = await changeCurrentPassword(updated.newPassword);
        if (result === 'NO_PASSWORD_PROVIDER') {
          showNotification('Tài khoản này đăng nhập bằng Google nên không có mật khẩu riêng để đổi.');
          return false;
        }
        return true;
      } catch (err) {
        showNotification(describeAuthError(err));
        return false;
      }
    }

    const patch = JSON.parse(
      JSON.stringify({
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl || currentUser.avatarUrl,
        coverUrl: updated.coverUrl || currentUser.coverUrl,
        bio: updated.bio !== undefined ? updated.bio : currentUser.bio,
        companyCode: updated.companyCode,
        areaCode: updated.areaCode,
        departmentCode: updated.departmentCode,
      })
    );

    try {
      await updateDoc(doc(db, 'users', currentUser.id), patch);
    } catch (err: any) {
      console.error(err);
      showNotification(`Không lưu được hồ sơ: ${err.message}`);
      return false;
    }

    // Đồng bộ sang hồ sơ thành viên thi đua của chính mình
    setMembers((prev) =>
      prev.map((m) =>
        m.id === currentUser.memberId
          ? {
              ...m,
              fullName: updated.fullName,
              avatarUrl: updated.avatarUrl || m.avatarUrl,
              coverUrl: updated.coverUrl || m.coverUrl,
              bio: updated.bio !== undefined ? updated.bio : m.bio,
              companyCode: updated.companyCode,
              areaCode: updated.areaCode,
              departmentCode: updated.departmentCode,
            }
          : m
      )
    );
    return true;
  };

  // Huong Khi Handlers: Add, React (Facebook-style), and Comment
  const handleAddHuongKhi = (item: Omit<HuongKhiItem, 'id' | 'likesCount'>) => {
    if (!currentUser) {
      showNotification('Vui lòng đăng nhập để đăng bài hương khí.');
      return;
    }
    const newItem: HuongKhiItem = {
      ...item,
      authorId: currentUser.memberId || item.authorId,
      id: `hk-${Date.now()}`,
      likesCount: 1,
      reactions: item.reactions || {
        heart: 1,
        pray: 1,
        praise: 0,
        fire: 0,
        blessing: 0,
        like: 0,
      },
      comments: item.comments || [],
    };
    setHuongKhiList((prev) => [newItem, ...prev]);
  };

  const handleReactHuongKhi = (id: string, reaction: ReactionType) => {
    if (!currentUser) {
      showNotification('Vui lòng đăng nhập để bày tỏ cảm xúc.');
      setIsAuthModalOpen(true);
      return;
    }
    const uid = currentUser.id;

    setHuongKhiList((prev) =>
      prev.map((hk) => {
        if (hk.id !== id) return hk;

        const reactions: ReactionCounts = {
          heart: 0,
          pray: 0,
          praise: 0,
          fire: 0,
          blessing: 0,
          like: 0,
          ...(hk.reactions || {}),
        };
        const userReactions: Record<string, ReactionType> = { ...(hk.userReactions || {}) };
        const prevUserReaction = userReactions[uid];
        let likesCount = hk.likesCount;

        if (prevUserReaction === reaction) {
          // Toggle off reaction
          reactions[reaction] = Math.max(0, (reactions[reaction] || 1) - 1);
          delete userReactions[uid];
          likesCount = Math.max(0, likesCount - 1);
        } else {
          // Switching from previous reaction (or first reaction)
          if (prevUserReaction) {
            reactions[prevUserReaction] = Math.max(0, (reactions[prevUserReaction] || 1) - 1);
          } else {
            likesCount = Math.max(1, likesCount + 1);
          }
          reactions[reaction] = (reactions[reaction] || 0) + 1;
          userReactions[uid] = reaction;
        }

        return { ...hk, reactions, userReactions, likesCount };
      })
    );
    showNotification('Đã bày tỏ cảm xúc thành công!');
  };

  const handleAddComment = (huongKhiId: string, content: string) => {
    if (!content.trim()) return;
    if (!currentUser) {
      showNotification('Vui lòng đăng nhập để bình luận.');
      setIsAuthModalOpen(true);
      return;
    }

    const newComment: HuongKhiComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatarUrl,
      companyCode: currentUser.companyCode,
      areaCode: currentUser.areaCode,
      content: content.trim(),
      createdAt: getCurrentFormattedTime(),
    };

    setHuongKhiList((prev) =>
      prev.map((hk) => {
        if (hk.id !== huongKhiId) return hk;
        return {
          ...hk,
          comments: [...(hk.comments || []), newComment],
        };
      })
    );
    showNotification('Đã đăng bình luận khích lệ thành công!');
  };

  // Target Management (Add / Update / Delete) with Step Dates
  const handleAddOrUpdateTarget = (
    memberId: string,
    targetName: string,
    steps: TargetSteps,
    stepDates?: StepDates
  ) => {
    const calc = calculateTargetScore(steps);
    const newTarget: TargetRecord = {
      id: `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      memberId,
      targetName,
      steps,
      stepDates,
      score: calc.score,
      status: calc.status,
      explanation: calc.explanation,
      recordedAt: getCurrentFormattedTime(),
    };

    setMembers((prev) => {
      return prev.map((m) => {
        if (m.id !== memberId) return m;

        const updatedTargets = [newTarget, ...(m.targets || [])];
        const newScore = computeMemberScore(updatedTargets);

        const newResults: MemberResults = {
          s1: (m.results?.s1 || 0) + (steps.s1 ? 1 : 0),
          s2: (m.results?.s2 || 0) + (steps.s2 ? 1 : 0),
          s3: (m.results?.s3 || 0) + (steps.s3 ? 1 : 0),
          s4: (m.results?.s4 || 0) + (steps.s4 ? 1 : 0),
          s5: (m.results?.s5 || 0) + (steps.s5 ? 1 : 0),
          s6: (m.results?.s6 || 0) + (steps.s6 ? 1 : 0),
        };

        return {
          ...m,
          targets: updatedTargets,
          score: newScore,
          results: newResults,
        };
      });
    });

    setLastUpdated(getCurrentFormattedTime());
  };

  const handleEditTarget = (
    memberId: string,
    targetId: string,
    targetName: string,
    steps: TargetSteps,
    stepDates?: StepDates
  ) => {
    const calc = calculateTargetScore(steps);

    setMembers((prev) => {
      return prev.map((m) => {
        if (m.id !== memberId) return m;

        const updatedTargets = (m.targets || []).map((t) => {
          if (t.id !== targetId) return t;
          return {
            ...t,
            targetName,
            steps,
            stepDates,
            score: calc.score,
            status: calc.status,
            explanation: calc.explanation,
          };
        });

        const newScore = computeMemberScore(updatedTargets);

        const newResults: MemberResults = {
          s1: updatedTargets.reduce((acc, t) => acc + (t.steps.s1 ? 1 : 0), 0),
          s2: updatedTargets.reduce((acc, t) => acc + (t.steps.s2 ? 1 : 0), 0),
          s3: updatedTargets.reduce((acc, t) => acc + (t.steps.s3 ? 1 : 0), 0),
          s4: updatedTargets.reduce((acc, t) => acc + (t.steps.s4 ? 1 : 0), 0),
          s5: updatedTargets.reduce((acc, t) => acc + (t.steps.s5 ? 1 : 0), 0),
          s6: updatedTargets.reduce((acc, t) => acc + (t.steps.s6 ? 1 : 0), 0),
        };

        return {
          ...m,
          targets: updatedTargets,
          score: newScore,
          results: newResults,
        };
      });
    });

    setLastUpdated(getCurrentFormattedTime());
    showNotification(`Đã cập nhật đối tượng "${targetName}" thành công!`);
  };

  const handleDeleteTarget = (memberId: string, targetId: string) => {
    setMembers((prev) => {
      return prev.map((m) => {
        if (m.id !== memberId) return m;
        const targetToDelete = m.targets?.find((t) => t.id === targetId);
        const updatedTargets = (m.targets || []).filter((t) => t.id !== targetId);
        const newScore = computeMemberScore(updatedTargets);

        let newResults = { ...m.results };
        if (targetToDelete) {
          newResults = {
            s1: Math.max(0, (newResults.s1 || 0) - (targetToDelete.steps.s1 ? 1 : 0)),
            s2: Math.max(0, (newResults.s2 || 0) - (targetToDelete.steps.s2 ? 1 : 0)),
            s3: Math.max(0, (newResults.s3 || 0) - (targetToDelete.steps.s3 ? 1 : 0)),
            s4: Math.max(0, (newResults.s4 || 0) - (targetToDelete.steps.s4 ? 1 : 0)),
            s5: Math.max(0, (newResults.s5 || 0) - (targetToDelete.steps.s5 ? 1 : 0)),
            s6: Math.max(0, (newResults.s6 || 0) - (targetToDelete.steps.s6 ? 1 : 0)),
          };
        }

        return {
          ...m,
          targets: updatedTargets,
          score: newScore,
          results: newResults,
        };
      });
    });
    showNotification('Đã xóa đối tượng và tính lại điểm thành viên.');
  };

  const handleUpdateGoals = (
    memberId: string,
    goals: MemberGoals,
    results: MemberResults
  ) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, goals, results } : m))
    );
  };

  const handleCreateQuickMember = (memberData: {
    fullName: string;
    companyCode: string;
    areaCode: string;
    departmentCode: string;
  }): Member => {
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      code: `MEM-${(members.length + 1).toString().padStart(3, '0')}`,
      fullName: memberData.fullName,
      companyCode: memberData.companyCode,
      areaCode: memberData.areaCode,
      departmentCode: memberData.departmentCode,
      active: true,
      score: 0,
      goals: { s1: 10, s2: 8, s3: 5, s4: 4, s5: 4, s6: 2 },
      results: { s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0 },
      targets: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setMembers((prev) => [newMember, ...prev]);
    return newMember;
  };

  // Admin CRUD functions
  const handleAddCompany = (company: Omit<Company, 'id'>) => {
    const newComp: Company = { ...company, id: `c-${Date.now()}` };
    setCompanies((prev) => [...prev, newComp]);
  };
  const handleUpdateCompany = (company: Company) => {
    setCompanies((prev) => prev.map((c) => (c.id === company.id ? company : c)));
  };
  const handleDeleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddArea = (area: Omit<Area, 'id'>) => {
    const newArea: Area = { ...area, id: `a-${Date.now()}` };
    setAreas((prev) => [...prev, newArea]);
  };
  const handleUpdateArea = (area: Area) => {
    setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)));
  };
  const handleDeleteArea = (id: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = { ...dept, id: `d-${Date.now()}` };
    setDepartments((prev) => [...prev, newDept]);
  };
  const handleUpdateDepartment = (dept: Department) => {
    setDepartments((prev) => prev.map((d) => (d.id === dept.id ? dept : d)));
  };
  const handleDeleteDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddMember = (
    member: Omit<Member, 'id' | 'code' | 'score' | 'targets' | 'createdAt'>
  ) => {
    const newMem: Member = {
      ...member,
      id: `m-${Date.now()}`,
      code: `MEM-${(members.length + 1).toString().padStart(3, '0')}`,
      score: 0,
      targets: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMembers((prev) => [newMem, ...prev]);
  };
  const handleUpdateMember = (member: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
  };
  const handleDeleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Batch updates from Excel
  const handleBatchUpdateCompanies = (newCompanies: Company[], mode: 'MERGE' | 'REPLACE' = 'MERGE') => {
    setCompanies((prev) => {
      if (mode === 'REPLACE') return newCompanies;
      const map = new Map(prev.map((c) => [c.code, c]));
      newCompanies.forEach((c) => map.set(c.code, { ...map.get(c.code), ...c }));
      return Array.from(map.values());
    });
    showNotification(`Đã đồng bộ ${newCompanies.length} công ty từ file Excel!`);
  };

  const handleBatchUpdateAreas = (newAreas: Area[], mode: 'MERGE' | 'REPLACE' = 'MERGE') => {
    setAreas((prev) => {
      if (mode === 'REPLACE') return newAreas;
      const map = new Map(prev.map((a) => [a.code, a]));
      newAreas.forEach((a) => map.set(a.code, { ...map.get(a.code), ...a }));
      return Array.from(map.values());
    });
    showNotification(`Đã đồng bộ ${newAreas.length} khu vực từ file Excel!`);
  };

  const handleBatchUpdateDepartments = (newDepts: Department[], mode: 'MERGE' | 'REPLACE' = 'MERGE') => {
    setDepartments((prev) => {
      if (mode === 'REPLACE') return newDepts;
      const map = new Map(prev.map((d) => [d.code, d]));
      newDepts.forEach((d) => map.set(d.code, { ...map.get(d.code), ...d }));
      return Array.from(map.values());
    });
    showNotification(`Đã đồng bộ ${newDepts.length} ban ngành từ file Excel!`);
  };

  const handleBatchUpdateMembers = (newMembers: Member[], mode: 'MERGE' | 'REPLACE' = 'MERGE') => {
    setMembers((prev) => {
      if (mode === 'REPLACE') return newMembers;
      const map = new Map(prev.map((m) => [m.code, m]));
      newMembers.forEach((m) => {
        const existing = map.get(m.code);
        if (existing) {
          map.set(m.code, {
            ...existing,
            ...m,
            targets: existing.targets || m.targets || [],
            score: existing.score || m.score || 0,
            results: existing.results || m.results,
          });
        } else {
          map.set(m.code, m);
        }
      });
      return Array.from(map.values());
    });
    showNotification(`Đã đồng bộ ${newMembers.length} thành viên từ file Excel!`);
  };

  // Nạp danh mục mẫu (công ty / khu vực / ban ngành). Không xóa dữ liệu đang có.
  const handleResetData = () => {
    seedStructure()
      .then(() => showNotification('Đã nạp danh mục mẫu (công ty, khu vực, ban ngành).'))
      .catch((err) => showNotification(`Không nạp được danh mục mẫu: ${err.message}`));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f6fb] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 antialiased selection:bg-amber-200 selection:text-amber-900 transition-colors duration-300">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        countdown={countdown}
        isAutoRefreshPaused={isAutoRefreshPaused}
        onTogglePause={() => setIsAutoRefreshPaused(!isAutoRefreshPaused)}
        onRefreshNow={handleRefresh}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Yêu cầu đăng nhập để xem dữ liệu dùng chung */}
      {authReady && !firebaseUser && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>Vui lòng đăng nhập để xem bảng xếp hạng và nhập kết quả thi đua.</strong>
              <br />
              Dữ liệu được lưu chung trên máy chủ, mọi thành viên cùng thấy một bảng xếp hạng.
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="shrink-0 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Đăng nhập / Đăng ký
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: VINH DANH (HONORS & DASHBOARD) */}
      {activeTab === 'HONORS' && (
        <div className="flex-1 pb-16">
          {/* Hero Banner with Spotlight & Auto Daily Bible Verse */}
          <HeroBanner onOpenRules={() => setIsRulesModalOpen(true)} />

          {/* 4 KPI Statistic Cards */}
          <KpiCards kpi={kpiData} />

          {/* Main Layout */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8 sm:mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Right Column on Desktop, FIRST on Mobile (Top 3 Podium on Top for Mobile) */}
              <div className="order-1 lg:order-2 lg:col-span-4 space-y-6">
                
                {/* Top 3 Podium with 3 Tabs (Cá nhân, Khu vực, Công ty) */}
                <PodiumTop3
                  members={rankedMembers}
                  areaRankings={areaRankings}
                  companyRankings={companyRankings}
                  onSelectMember={setSelectedMember}
                />

                {/* Regional Statistics */}
                <RegionalStats
                  areaRankings={areaRankings}
                  selectedAreaCode={selectedAreaCode}
                  onSelectAreaCode={setSelectedAreaCode}
                  onOpenDetailsModal={() => setIsRegionalModalOpen(true)}
                />

                {/* Quick Actions Card */}
                <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-5 text-white shadow-md border border-slate-800 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                      <span>⚡ Thao tác nhanh</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-white mb-1">
                      Nhập mục tiêu & kết quả thi đua
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Chuyển sang trang nhập kết quả để đăng ký mục tiêu và ghi nhận đối tượng với tùy chọn ngày thực tế.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab('ENTRY')}
                      className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>✏️ Chuyển sang Nhập kết quả</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('PROFILE')}
                      className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
                    >
                      <span>👤 Xem Hồ sơ cá nhân của bạn</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Left Column on Desktop, SECOND on Mobile */}
              <div className="order-2 lg:order-1 lg:col-span-8 space-y-6">
                <LeaderboardTable
                  members={rankedMembers}
                  companyRankings={companyRankings}
                  areaRankings={areaRankings}
                  lastUpdated={lastUpdated}
                  selectedAreaCode={selectedAreaCode}
                  onSelectAreaCode={setSelectedAreaCode}
                  onSelectMember={setSelectedMember}
                  onOpenRules={() => setIsRulesModalOpen(true)}
                />

                {/* News & Huong Khi Section with Reactions & Comments */}
                <NewsSection
                  huongKhiList={huongKhiView}
                  currentUser={currentUser}
                  onReactHuongKhi={handleReactHuongKhi}
                  onAddComment={handleAddComment}
                  onOpenRules={() => setIsRulesModalOpen(true)}
                />
              </div>

            </div>
          </main>
        </div>
      )}

      {/* TAB 2: NHẬP MỤC TIÊU & KẾT QUẢ THI ĐUA */}
      {activeTab === 'ENTRY' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex-1">
          <ResultEntrySection
            companies={companies}
            areas={areas}
            departments={departments}
            members={rankedMembers}
            currentUser={currentUser}
            onAddOrUpdateTarget={handleAddOrUpdateTarget}
            onEditTarget={handleEditTarget}
            onDeleteTarget={handleDeleteTarget}
            onUpdateGoals={handleUpdateGoals}
            onCreateQuickMember={handleCreateQuickMember}
            onShowNotification={showNotification}
            onOpenRules={() => setIsRulesModalOpen(true)}
          />
        </main>
      )}

      {/* TAB 3: HỒ SƠ CÁ NHÂN (PROFILE) */}
      {activeTab === 'PROFILE' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex-1">
          {currentUser ? (
            <ProfilePage
              currentUser={currentUser}
              memberData={currentMemberData}
              myHuongKhiList={myHuongKhiList}
              companies={companies}
              areas={areas}
              departments={departments}
              onNavigateToEntry={() => setActiveTab('ENTRY')}
              onNavigateToHonors={() => setActiveTab('HONORS')}
              onLogout={handleLogout}
              onOpenRules={() => setIsRulesModalOpen(true)}
              onAddHuongKhi={handleAddHuongKhi}
              onReactHuongKhi={handleReactHuongKhi}
              onAddComment={handleAddComment}
              onUpdateProfile={handleUpdateProfile}
              onEditTarget={handleEditTarget}
              onDeleteTarget={handleDeleteTarget}
              onShowNotification={showNotification}
            />
          ) : (
            <div className="bg-white rounded-3xl p-8 max-w-md mx-auto text-center shadow-sm border border-slate-100 my-12">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Chưa đăng nhập</h3>
              <p className="text-xs text-slate-500 mb-6">
                Vui lòng đăng nhập hoặc đăng ký tài khoản cá nhân để xem trang hồ sơ của bạn.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Đăng nhập / Đăng ký ngay
              </button>
            </div>
          )}
        </main>
      )}

      {/* TAB 4: TRANG QUẢN TRỊ (ADMIN) - Chỉ cho phép quyền ADMIN */}
      {activeTab === 'ADMIN' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex-1">
          {currentUser?.role === 'ADMIN' ? (
            <AdminPanel
              companies={companies}
              areas={areas}
              departments={departments}
              members={rankedMembers}
              onAddCompany={handleAddCompany}
              onUpdateCompany={handleUpdateCompany}
              onDeleteCompany={handleDeleteCompany}
              onAddArea={handleAddArea}
              onUpdateArea={handleUpdateArea}
              onDeleteArea={handleDeleteArea}
              onAddDepartment={handleAddDepartment}
              onUpdateDepartment={handleUpdateDepartment}
              onDeleteDepartment={handleDeleteDepartment}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              onBatchUpdateCompanies={handleBatchUpdateCompanies}
              onBatchUpdateAreas={handleBatchUpdateAreas}
              onBatchUpdateDepartments={handleBatchUpdateDepartments}
              onBatchUpdateMembers={handleBatchUpdateMembers}
              onResetData={handleResetData}
              onShowNotification={showNotification}
            />
          ) : (
            <div className="bg-white rounded-3xl p-8 max-w-lg mx-auto text-center shadow-sm border border-slate-100 my-12">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Khu vực Giới hạn Quyền</h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Tài khoản cá nhân chỉ được xem dashboard, nhập mục tiêu và kết quả thi đua. Trang Quản trị yêu cầu tài khoản Ban Quản Trị hệ thống.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('HONORS')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Về trang vinh danh
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Chuyển sang tài khoản Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Auth Modal (Login / Register / Gmail Verification) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        companies={companies}
        areas={areas}
        departments={departments}
        onRegister={handleRegister}
      />

      {/* Member Details Modal */}
      <DetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      {/* Regional Details Modal */}
      <RegionalDetailModal
        isOpen={isRegionalModalOpen}
        onClose={() => setIsRegionalModalOpen(false)}
        areaRankings={areaRankings}
        onSelectAreaCode={(code) => setSelectedAreaCode(code)}
      />

      {/* Scoring Rules Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onScrollToSection={(sec) => {
          if (sec === 'leaderboard-section') setActiveTab('HONORS');
          if (sec === 'entry-section') setActiveTab('ENTRY');
          if (sec === 'admin-section') setActiveTab('ADMIN');
        }}
      />

    </div>
  );
}
