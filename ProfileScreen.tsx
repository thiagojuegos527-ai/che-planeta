import React, { useState } from 'react';
import {
  User,
  Award,
  Flame,
  Camera,
  History,
  CheckCircle2,
  Calendar,
  Sparkles,
  TreePine,
  Edit2,
  Check,
  TrendingUp,
  Share2
} from 'lucide-react';
import { UserProfile, PetState, EcoStreak, Badge } from '../types/gamification';
import { EcoAnalysisResult } from '../types/chePlaneta';
import { INITIAL_BADGES, getStageName } from '../utils/gamificationDefaults';

interface ProfileScreenProps {
  profile: UserProfile;
  pet: PetState;
  streak: EcoStreak;
  history: EcoAnalysisResult[];
  badges: Badge[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSelectHistoryItem: (item: EcoAnalysisResult) => void;
  onOpenHistoryModal: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  pet,
  streak,
  history,
  badges,
  onUpdateProfile,
  onSelectHistoryItem,
  onOpenHistoryModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState(profile.username);
  const [selectedEmoji, setSelectedEmoji] = useState(profile.avatarEmoji);

  const emojiOptions = ['🌍', '🌱', '🦊', '🌿', '🌻', '🐢', '🐝', '🐳', '🍀'];

  const handleSave = () => {
    if (usernameInput.trim()) {
      onUpdateProfile({
        username: usernameInput.trim(),
        avatarEmoji: selectedEmoji,
      });
    }
    setIsEditing(false);
  };

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="max-w-md mx-auto px-4 pt-3 pb-28 flex flex-col items-center">
      {/* USER HERO CARD */}
      <div className="w-full p-4 rounded-3xl bg-white border border-emerald-900/10 shadow-xs flex flex-col items-center text-center relative mb-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-100 hover:bg-emerald-50 text-stone-500 hover:text-emerald-700 flex items-center justify-center transition-colors"
          title="Editar perfil"
        >
          {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
        </button>

        {/* Avatar with level badge */}
        <div className="relative mb-2">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md border-4 border-white"
            style={{ backgroundColor: profile.avatarBgColor }}
          >
            {isEditing ? selectedEmoji : profile.avatarEmoji}
          </div>
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] shadow-xs border-2 border-white">
            Nv. {pet.level}
          </div>
        </div>

        {isEditing ? (
          <div className="w-full max-w-xs space-y-2 mt-1">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-1.5 rounded-xl border border-emerald-400 bg-stone-50 text-center font-heading font-bold text-sm text-stone-900 focus:outline-none focus:bg-white"
            />
            {/* Emoji Selector */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap py-1">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-transform ${
                    selectedEmoji === emoji ? 'bg-emerald-100 scale-110 ring-2 ring-emerald-500' : 'bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 text-white font-heading font-bold text-xs"
            >
              Guardar Cambios
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-heading font-extrabold text-xl text-stone-900">
              {profile.username}
            </h1>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">
              {profile.title} &bull; Compañero de {pet.name}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Miembro desde {profile.joinedDate}</span>
            </p>
          </>
        )}

        {/* Global Impact Grid */}
        <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-100">
          <div className="p-2 rounded-xl bg-stone-50">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">EcoPuntos</span>
            <span className="font-heading font-extrabold text-sm text-emerald-800">
              {profile.ecoPoints}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-stone-50">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Racha</span>
            <span className="font-heading font-extrabold text-sm text-amber-600 flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              {streak.currentDays}d
            </span>
          </div>

          <div className="p-2 rounded-xl bg-stone-50">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Escaneos</span>
            <span className="font-heading font-extrabold text-sm text-sky-700">
              {profile.totalScans}
            </span>
          </div>
        </div>
      </div>

      {/* COZY REAL-WORLD ENVIRONMENTAL IMPACT CARD */}
      <div className="w-full p-4 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 shadow-xs mb-4">
        <h2 className="font-heading font-extrabold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5 mb-2.5">
          <TrendingUp className="w-4 h-4 text-emerald-700" />
          <span>Tu Huella Positiva en el Planeta</span>
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-white/90 border border-emerald-200/60">
            <span className="text-2xl">🌱</span>
            <p className="font-heading font-extrabold text-base text-stone-900 mt-1">
              ~{profile.co2SavedKg} kg
            </p>
            <p className="text-[10px] text-stone-500">
              CO₂ evitado mediante reciclaje y reutilización estimada.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/90 border border-emerald-200/60">
            <span className="text-2xl">🧴</span>
            <p className="font-heading font-extrabold text-base text-stone-900 mt-1">
              {profile.plasticDivertedItems} envases
            </p>
            <p className="text-[10px] text-stone-500">
              Desviados de rellenos sanitarios o basurales abiertos.
            </p>
          </div>
        </div>
      </div>

      {/* INSIGNIAS Y LOGROS */}
      <div className="w-full mb-4">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="font-heading font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Insignias Ganadas ({unlockedBadgesCount}/{badges.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-2xl border transition-all text-left flex items-start gap-2.5 ${
                badge.unlocked
                  ? 'bg-white border-amber-200 shadow-2xs'
                  : 'bg-stone-50 border-stone-200 opacity-50'
              }`}
            >
              <span className={`text-2xl shrink-0 ${badge.unlocked ? '' : 'grayscale'}`}>
                {badge.icon}
              </span>
              <div>
                <h4 className="font-heading font-bold text-xs text-stone-900 leading-tight">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                  {badge.description}
                </p>
                {badge.unlocked && badge.unlockedAt && (
                  <span className="inline-block text-[9px] font-bold text-emerald-700 mt-1 bg-emerald-50 px-1.5 py-0.2 rounded">
                    Desbloqueado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HISTORIAL DE ESCANEOS RECIENTES */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="font-heading font-extrabold text-sm text-stone-900 flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-700" />
            <span>Historial de Análisis ({history.length})</span>
          </h2>
          {history.length > 2 && (
            <button
              onClick={onOpenHistoryModal}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Ver todos
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-stone-200 text-center text-xs text-stone-500">
            Aún no guardaste escaneos. ¡Escaneá tu primer objeto para llenar tu historial!
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectHistoryItem(item)}
                className="w-full p-2.5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 flex items-center gap-3 text-left transition-all shadow-2xs group"
              >
                <img
                  src={item.imageUrl}
                  alt={item.objectName}
                  className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-100"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800">
                    {item.category}
                  </span>
                  <h4 className="font-heading font-bold text-xs text-stone-900 group-hover:text-emerald-700 truncate mt-0.5">
                    {item.objectName}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {item.probableMaterial}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-700">
                    {item.recyclabilityScore}/100
                  </span>
                  <p className="text-[10px] text-stone-400">Score</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
