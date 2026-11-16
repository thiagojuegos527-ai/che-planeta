import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TopGamificationBar } from './components/TopGamificationBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { CameraScreen } from './components/CameraScreen';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryDrawer } from './components/HistoryDrawer';
import { MyPlanetScreen } from './components/MyPlanetScreen';
import { MissionsScreen } from './components/MissionsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { StreakModal } from './components/StreakModal';
import { EcoAnalysisResult } from './types/chePlaneta';
import { SampleObject, SAMPLE_OBJECTS } from './utils/sampleImages';
import {
  MainNavTab,
  PetState,
  EcoStreak,
  UserProfile,
  EcoMission,
  Badge,
} from './types/gamification';
import {
  INITIAL_PET_STATE,
  INITIAL_STREAK,
  INITIAL_PROFILE,
  INITIAL_MISSIONS,
  INITIAL_BADGES,
  calculateXpForLevel,
  getStageForLevel,
  getStageName,
} from './utils/gamificationDefaults';

type ScreenState = 'home' | 'camera' | 'analyzing' | 'results';

const STORAGE_KEY_SCANS = 'che_planeta_scans_v1';
const STORAGE_KEY_GAMIFICATION = 'che_planeta_gamification_v2';

export default function App() {
  // Screen and Scan flows
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('home');
  const [currentTab, setCurrentTab] = useState<MainNavTab>('home');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [currentResult, setCurrentResult] = useState<EcoAnalysisResult | null>(null);
  const [history, setHistory] = useState<EcoAnalysisResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Gamification States
  const [pet, setPet] = useState<PetState>(INITIAL_PET_STATE);
  const [streak, setStreak] = useState<EcoStreak>(INITIAL_STREAK);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [missions, setMissions] = useState<EcoMission[]>(INITIAL_MISSIONS);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);

  // Load persistence
  useEffect(() => {
    try {
      const storedScans = localStorage.getItem(STORAGE_KEY_SCANS);
      if (storedScans) {
        const parsed = JSON.parse(storedScans);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }

      const storedGamification = localStorage.getItem(STORAGE_KEY_GAMIFICATION);
      if (storedGamification) {
        const gData = JSON.parse(storedGamification);
        if (gData.pet) setPet(gData.pet);
        if (gData.streak) setStreak(gData.streak);
        if (gData.profile) setProfile(gData.profile);
        if (gData.missions) setMissions(gData.missions);
        if (gData.badges) setBadges(gData.badges);
      }
    } catch (e) {
      console.warn('Could not load data from localStorage:', e);
    }
  }, []);

  // Save gamification persistence
  const persistGamification = (
    newPet = pet,
    newStreak = streak,
    newProfile = profile,
    newMissions = missions,
    newBadges = badges
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY_GAMIFICATION,
        JSON.stringify({
          pet: newPet,
          streak: newStreak,
          profile: newProfile,
          missions: newMissions,
          badges: newBadges,
        })
      );
    } catch (e) {
      console.warn('Failed to save gamification data:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Award XP and check for Level Up & Evolution
  const awardXpAndPoints = (xpAmount: number, pointsAmount: number) => {
    let nextXp = pet.xp + xpAmount;
    let nextLevel = pet.level;
    let nextXpNeeded = pet.xpToNextLevel;
    let leveledUp = false;

    while (nextXp >= nextXpNeeded) {
      nextXp -= nextXpNeeded;
      nextLevel += 1;
      nextXpNeeded = calculateXpForLevel(nextLevel);
      leveledUp = true;
    }

    const nextStage = getStageForLevel(nextLevel);
    const evolved = nextStage !== pet.stage;

    const updatedPet: PetState = {
      ...pet,
      xp: nextXp,
      level: nextLevel,
      xpToNextLevel: nextXpNeeded,
      stage: nextStage,
      happiness: Math.min(100, pet.happiness + 5),
    };

    const updatedProfile: UserProfile = {
      ...profile,
      ecoPoints: profile.ecoPoints + pointsAmount,
    };

    // Unlock badges if conditions met
    let updatedBadges = [...badges];
    if (evolved) {
      updatedBadges = updatedBadges.map((b) => {
        if (nextStage === 'sprout' && b.id === 'badge-pet-evolve') return { ...b, unlocked: true, unlockedAt: 'Hoy' };
        if (nextStage === 'bloom' && b.id === 'badge-pet-bloom') return { ...b, unlocked: true, unlockedAt: 'Hoy' };
        if (nextStage === 'guardian' && b.id === 'badge-pet-guardian') return { ...b, unlocked: true, unlockedAt: 'Hoy' };
        return b;
      });
    }

    setPet(updatedPet);
    setProfile(updatedProfile);
    setBadges(updatedBadges);
    persistGamification(updatedPet, streak, updatedProfile, missions, updatedBadges);

    if (evolved) {
      showToast(`✨ ¡Tu planeta evolucionó a ${getStageName(nextStage)}! 🌍🎉`);
    } else if (leveledUp) {
      showToast(`🎉 ¡Subiste a Nivel ${nextLevel}! +${pointsAmount} EcoPuntos 🌱`);
    } else {
      showToast(`+${xpAmount} XP &bull; +${pointsAmount} EcoPuntos ganados ✨`);
    }
  };

  // Progress missions based on category
  const progressMissions = (category: 'scan' | 'diy' | 'disposal' | 'learn' | 'community', increment = 1) => {
    const updated = missions.map((m) => {
      if (m.category === category && !m.completed) {
        const nextCount = m.currentCount + increment;
        const isDone = nextCount >= m.targetCount;
        return {
          ...m,
          currentCount: nextCount,
          completed: isDone,
        };
      }
      return m;
    });

    setMissions(updated);
    persistGamification(pet, streak, profile, updated, badges);
  };

  // Claim completed mission reward
  const handleClaimMissionReward = (missionId: string) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || mission.rewardClaimed) return;

    const updatedMissions = missions.map((m) =>
      m.id === missionId ? { ...m, rewardClaimed: true } : m
    );

    const updatedProfile: UserProfile = {
      ...profile,
      completedMissionsCount: profile.completedMissionsCount + 1,
    };

    setMissions(updatedMissions);
    setProfile(updatedProfile);
    awardXpAndPoints(mission.xpReward, mission.pointsReward);
    persistGamification(pet, streak, updatedProfile, updatedMissions, badges);
  };

  // Pet Care
  const handlePetPet = () => {
    const updatedPet: PetState = {
      ...pet,
      happiness: Math.min(100, pet.happiness + 8),
    };
    setPet(updatedPet);
    progressMissions('community', 1);
    persistGamification(updatedPet);
  };

  const handleCleanPet = () => {
    const updatedPet: PetState = {
      ...pet,
      cleanliness: Math.min(100, pet.cleanliness + 10),
      happiness: Math.min(100, pet.happiness + 4),
    };
    setPet(updatedPet);
    showToast('💧 ¡Atmósfera regada y purificada con amor!');
    persistGamification(updatedPet);
  };

  // Customization
  const handleSelectPalette = (paletteId: string) => {
    const updatedPet: PetState = {
      ...pet,
      colorPaletteId: paletteId,
    };
    setPet(updatedPet);
    showToast('🎨 ¡Colores de biosfera actualizados!');
    persistGamification(updatedPet);
  };

  const handleEquipAccessory = (accId: string, slot: 'head' | 'face' | 'body' | 'hand' | 'ambient') => {
    const updatedPet: PetState = {
      ...pet,
      equippedAccessories: {
        ...pet.equippedAccessories,
        [slot]: accId,
      },
    };
    setPet(updatedPet);
    showToast('✨ ¡Accesorio equipado!');
    persistGamification(updatedPet);
  };

  const handleUnequipAccessory = (slot: 'head' | 'face' | 'body' | 'hand' | 'ambient') => {
    const updatedPet: PetState = {
      ...pet,
      equippedAccessories: {
        ...pet.equippedAccessories,
        [slot]: undefined,
      },
    };
    setPet(updatedPet);
    persistGamification(updatedPet);
  };

  const handleToggleBiomeItem = (biomeId: string) => {
    let updatedItems = [...pet.placedBiomeItems];
    if (updatedItems.includes(biomeId)) {
      updatedItems = updatedItems.filter((id) => id !== biomeId);
      showToast('Elemento guardado en el inventario');
    } else {
      updatedItems.push(biomeId);
      showToast('🌿 ¡Elemento colocado en tu biosfera!');
    }
    const updatedPet: PetState = { ...pet, placedBiomeItems: updatedItems };
    setPet(updatedPet);
    persistGamification(updatedPet);
  };

  const handleUpdatePetName = (newName: string) => {
    const updatedPet: PetState = { ...pet, name: newName };
    setPet(updatedPet);
    showToast(`Tu mascota ahora se llama ${newName} 🌍`);
    persistGamification(updatedPet);
  };

  // Streak pause / shields
  const handleTogglePauseStreak = () => {
    const updatedStreak: EcoStreak = {
      ...streak,
      isPaused: !streak.isPaused,
    };
    setStreak(updatedStreak);
    showToast(
      updatedStreak.isPaused
        ? '⏸️ Racha pausada. No perderás tu progreso.'
        : '▶️ ¡Racha reanudada con éxito!'
    );
    persistGamification(pet, updatedStreak);
  };

  // Save history scan
  const saveToHistory = (result: EcoAnalysisResult) => {
    setHistory((prev) => {
      const exists = prev.some(
        (item) => item.objectName === result.objectName && item.timestamp === result.timestamp
      );
      if (exists) {
        showToast('¡Este objeto ya está en tu historial!');
        return prev;
      }
      const updated = [result, ...prev].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY_SCANS, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not persist history to localStorage:', err);
      }
      return updated;
    });

    // Update real environmental metrics
    const updatedProfile: UserProfile = {
      ...profile,
      totalScans: profile.totalScans + 1,
      co2SavedKg: Number((profile.co2SavedKg + 0.45).toFixed(2)),
      plasticDivertedItems: profile.plasticDivertedItems + 1,
    };
    setProfile(updatedProfile);

    // Update daily streak
    const todayStr = new Date().toISOString().split('T')[0];
    if (streak.lastActiveDate !== todayStr && !streak.isPaused) {
      const nextDays = streak.currentDays + 1;
      const updatedStreak: EcoStreak = {
        ...streak,
        currentDays: nextDays,
        longestDays: Math.max(streak.longestDays, nextDays),
        lastActiveDate: todayStr,
        historyDates: [...streak.historyDates, todayStr],
      };
      setStreak(updatedStreak);
      persistGamification(pet, updatedStreak, updatedProfile);
    } else {
      persistGamification(pet, streak, updatedProfile);
    }

    // Award Scan XP & EcoPoints
    awardXpAndPoints(60, 35);
    progressMissions('scan', 1);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_SCANS);
    } catch (e) {
      // ignore
    }
    showToast('Historial vaciado correctamente');
  };

  // Perform AI analysis via server
  const analyzeImage = async (imageDataUrl: string, userHint?: string) => {
    setCapturedImage(imageDataUrl);
    setCurrentScreen('analyzing');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          userHint: userHint || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.fallbackAvailable && errorData.fallbackData) {
          const fallback = {
            ...errorData.fallbackData,
            imageUrl: imageDataUrl,
            timestamp: new Date().toISOString(),
          };
          setCurrentResult(fallback);
          saveToHistory(fallback);
          setCurrentScreen('results');
          return;
        }
        throw new Error(errorData.error || 'Error al conectar con la IA de Che Planeta.');
      }

      const resultData: EcoAnalysisResult = await response.json();
      setCurrentResult(resultData);
      saveToHistory(resultData);
      setCurrentScreen('results');
    } catch (err: any) {
      console.warn('Analysis error, using intelligent fallback response:', err);
      const fallbackResult: EcoAnalysisResult = {
        objectName: userHint || 'Envase Reciclable Común',
        category: 'Materiales y Envases del Hogar',
        probableMaterial: 'Polímero Termoplástico / Cartón Reciclable',
        materialDetails:
          'Material común de envase que puede reincorporarse al ciclo productivo si se limpia y separa en seco.',
        recyclabilityScore: 88,
        recyclabilityBadge: 'Reciclable con Preparación',
        badgeColor: 'emerald',
        summary:
          '¡Excelente decisión consultar antes de tirar! Con una separación correcta evitás que termine en rellenos sanitarios.',
        diyIdeas: [
          {
            id: 'diy-fallback-1',
            title: 'Organizador de Escritorio o Herramientas',
            subtitle: 'Reutilizá el contenedor para mantener ordenados tus cables o útiles',
            difficulty: 'Fácil',
            timeMinutes: 10,
            materialsNeeded: ['Envase limpio', 'Tijera o cúter', 'Papel decorativo o pintura'],
            steps: [
              'Lavá y secá completamente el contenedor.',
              'Cortá los bordes superiores a la altura deseada.',
              'Personalizalo con retazos de tela, soga de yute o pintura acrílica.',
            ],
            ecoBenefit: 'Alarga la vida útil del objeto antes de su disposición final.',
          },
        ],
        disposalGuide: {
          containerColor: 'Verde',
          containerColorHex: '#10B981',
          containerName: 'Contenedor Verde (Reciclables Secos)',
          preparationSteps: [
            'Vaciá cualquier contenido sobrante.',
            'Enjuagá con un toque mínimo de agua.',
            'Dejá secar bien para no humedecer cartones o papeles vecinos.',
            'Aplastá para optimizar el espacio de recolección.',
          ],
          warnings: ['No lo descartes sucio ni con restos orgánicos.'],
          recyclingCategory: 'Reciclables Limpios y Secos',
          recyclingCenterType: 'Campanas verdes y puntos limpios barriales',
        },
        environmentalImpact: {
          yearsToDegrade: '100 a 400 años',
          yearsNumericRange: [100, 400],
          carbonFootprint: 'Aprox. 70g de CO2 eq por unidad estándar.',
          wildlifeDanger: 'Fragmentación en partículas que alteran la fauna y el suelo.',
          oceanImpact: 'Puede llegar a cursos de agua si no se deposita en los contenedores designados.',
          conservationTip: 'Optá por formatos recargables o a granel siempre que sea posible.',
        },
        reliableSources: [
          {
            name: 'Guía de Separación en Origen',
            organization: 'Ministerio de Ambiente y Desarrollo Sostenible',
            url: 'https://www.argentina.gob.ar/ambiente',
            topic: 'Gestión Integral de Residuos',
            fact: 'La separación en origen permite recuperar más del 70% de los materiales secos.',
          },
        ],
        cheConsejo:
          '¡Che, gran laburo separando tus residuos! Cada objeto que recuperás evita contaminación y apoya a las cooperativas de recuperadores urbanos.',
        timestamp: new Date().toISOString(),
        imageUrl: imageDataUrl,
      };

      setCurrentResult(fallbackResult);
      saveToHistory(fallbackResult);
      setCurrentScreen('results');
    }
  };

  const handleSelectSample = (sample: SampleObject) => {
    analyzeImage(sample.dataUrl, sample.userHint || sample.name);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        analyzeImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Bottom Navigation tab changer
  const handleNavTab = (tab: MainNavTab) => {
    if (tab === 'scan') {
      setCurrentScreen('camera');
      return;
    }
    setCurrentTab(tab);
    if (currentScreen !== 'home') {
      setCurrentScreen('home');
    }
  };

  const unclaimedMissionsCount = missions.filter((m) => m.completed && !m.rewardClaimed).length;

  return (
    <div className="min-h-screen bg-[#FBF9F3] text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Persistent Header */}
      {currentScreen !== 'camera' && (
        <>
          <Header
            onOpenHistory={() => setIsHistoryOpen(true)}
            historyCount={history.length}
            onNavigateHome={() => {
              setCurrentScreen('home');
              setCurrentTab('home');
            }}
          />
          <TopGamificationBar
            streak={streak}
            profile={profile}
            pet={pet}
            onOpenStreakModal={() => setIsStreakModalOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            historyCount={history.length}
          />
        </>
      )}

      {/* Main Screen Switcher */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <>
            {currentTab === 'home' && (
              <HomeScreen
                onStartScan={() => setCurrentScreen('camera')}
                onSelectSample={handleSelectSample}
                onUploadFile={handleFileUpload}
                recentScans={history}
                onSelectRecent={(item) => {
                  setCurrentResult(item);
                  setCurrentScreen('results');
                }}
                pet={pet}
                streak={streak}
                profile={profile}
                onNavigateMyPlanet={() => setCurrentTab('my-planet')}
                onNavigateMissions={() => setCurrentTab('missions')}
                onPetPet={handlePetPet}
              />
            )}

            {currentTab === 'my-planet' && (
              <MyPlanetScreen
                pet={pet}
                profile={profile}
                onUpdatePetName={handleUpdatePetName}
                onSelectPalette={handleSelectPalette}
                onEquipAccessory={handleEquipAccessory}
                onUnequipAccessory={handleUnequipAccessory}
                onToggleBiomeItem={handleToggleBiomeItem}
                onPetPet={handlePetPet}
                onCleanPet={handleCleanPet}
                onNavigateScan={() => setCurrentScreen('camera')}
              />
            )}

            {currentTab === 'missions' && (
              <MissionsScreen
                missions={missions}
                streak={streak}
                onClaimMissionReward={handleClaimMissionReward}
                onTogglePauseStreak={handleTogglePauseStreak}
                onUseShield={() => {}}
                onNavigateScan={() => setCurrentScreen('camera')}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileScreen
                profile={profile}
                pet={pet}
                streak={streak}
                history={history}
                badges={badges}
                onUpdateProfile={(updated) => {
                  const newProf = { ...profile, ...updated };
                  setProfile(newProf);
                  persistGamification(pet, streak, newProf);
                }}
                onSelectHistoryItem={(item) => {
                  setCurrentResult(item);
                  setCurrentScreen('results');
                }}
                onOpenHistoryModal={() => setIsHistoryOpen(true)}
              />
            )}
          </>
        )}

        {currentScreen === 'camera' && (
          <CameraScreen
            onCapture={(img) => analyzeImage(img)}
            onCancel={() => setCurrentScreen('home')}
            onSelectSample={handleSelectSample}
          />
        )}

        {currentScreen === 'analyzing' && (
          <AnalyzingScreen capturedImage={capturedImage} />
        )}

        {currentScreen === 'results' && currentResult && (
          <ResultsScreen
            result={currentResult}
            onScanAnother={() => setCurrentScreen('camera')}
            onSaveToHistory={saveToHistory}
            isSaved={history.some(
              (h) => h.objectName === currentResult.objectName && h.timestamp === currentResult.timestamp
            )}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation on all primary screens */}
      {currentScreen !== 'camera' && currentScreen !== 'analyzing' && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={handleNavTab}
          unclaimedMissionsCount={unclaimedMissionsCount}
        />
      )}

      {/* History Slide Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(item) => {
          setCurrentResult(item);
          setCurrentScreen('results');
        }}
        onClearHistory={clearHistory}
      />

      {/* Streak Details Modal */}
      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streak={streak}
        onTogglePause={handleTogglePauseStreak}
        onUseShield={() => {}}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm animate-in fade-in flex items-center gap-2 max-w-[90vw] text-center">
          <span>🌿</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
