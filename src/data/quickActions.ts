import { QuickAction } from '../types';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'correct-exercise',
    iconName: 'Sparkles',
    label: 'Corriger un exercice',
    hint: 'Joins une photo ou colle ton énoncé',
    prompt: 'Je vais te soumettre un exercice à corriger étape par étape. Indique-moi les éléments clés à te fournir pour une correction optimale.',
    category: 'correction',
  },
  {
    id: 'memorize',
    iconName: 'Brain',
    label: 'Mieux mémoriser',
    hint: 'Rappel actif, répétition espacée…',
    prompt: 'Quelles sont les meilleures techniques scientifiques pour mémoriser durablement mes formules et théorèmes pour le concours ?',
    category: 'method',
  },
  {
    id: 'study-plan',
    iconName: 'Calendar',
    label: 'Organiser mes révisions',
    hint: 'Planning, priorités, régularité',
    prompt: 'Aide-moi à structurer un planning de révision hebdomadaire équilibré et intensif pour mon concours.',
    category: 'planning',
  },
  {
    id: 'stress-management',
    iconName: 'HeartPulse',
    label: 'Gérer le stress d\'examen',
    hint: 'Avant et pendant l\'épreuve',
    prompt: 'Donne-moi des astuces concrètes pour surmonter le stress, la panique et les trous de mémoire le jour de l\'épreuve.',
    category: 'mindset',
  },
  {
    id: 'feynman-method',
    iconName: 'Lightbulb',
    label: 'Méthode Feynman',
    hint: 'Comprendre un concept complexe',
    prompt: 'Comment utiliser la méthode Feynman pour maîtriser en profondeur les chapitres les plus difficiles de mon programme ?',
    category: 'method',
  },
  {
    id: 'mcq-strategy',
    iconName: 'CheckCircle2',
    label: 'Stratégie QCM & Rapidité',
    hint: 'Élimination, gestion du chrono',
    prompt: 'Quelles sont les meilleures astuces pour répondre vite et sans erreur aux QCM de concours à points négatifs ?',
    category: 'correction',
  },
];
