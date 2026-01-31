
import { TarotCard, Category, Spread } from './types.ts';

export const CATEGORIES: Category[] = [
  'Love',
  'Career',
  'Money',
  'General Guidance'
];

export const SPREADS: Spread[] = [
  {
    id: 'past-present-future',
    name: 'The Path of Time',
    description: 'A classic structure to see where you’ve been and where you are headed.',
    positions: [
      { title: 'The Past', description: 'Influences that are receding but still relevant.' },
      { title: 'The Present', description: 'Your current energy and surroundings.' },
      { title: 'The Potential Future', description: 'Where things are currently trending.' }
    ]
  },
  {
    id: 'problem-solution',
    name: 'The Clarity Bridge',
    description: 'Perfect for overcoming a specific hurdle.',
    positions: [
      { title: 'The Core Challenge', description: 'The heart of the matter you are facing.' },
      { title: 'The Tool for Change', description: 'A mindset or action that will help you move forward.' }
    ]
  },
  {
    id: 'decision',
    name: 'The Crossroads',
    description: 'Compare two different paths or perspectives.',
    positions: [
      { title: 'Path A', description: 'The likely outcome of the first option.' },
      { title: 'Path B', description: 'The likely outcome of the second option.' },
      { title: 'The Deciding Factor', description: 'What you should weigh most heavily.' }
    ]
  },
  {
    id: 'relationship',
    name: 'The Mirror',
    description: 'Best for understanding dynamics between two people.',
    positions: [
      { title: 'Your Perspective', description: 'How you are showing up in this dynamic.' },
      { title: 'Their Perspective', description: 'How the other person or the situation perceives you.' },
      { title: 'The Connection', description: 'The common ground or friction between you.' }
    ]
  }
];

export const DECK: TarotCard[] = [
  { id: '0', name: 'The Fool', keyword: 'New beginnings, spontaneity, potential.', image: 'https://picsum.photos/seed/fool/400/600' },
  { id: '1', name: 'The Magician', keyword: 'Resourcefulness, manifestation, skill.', image: 'https://picsum.photos/seed/magician/400/600' },
  { id: '2', name: 'The High Priestess', keyword: 'Intuition, inner knowledge, stillness.', image: 'https://picsum.photos/seed/priestess/400/600' },
  { id: '3', name: 'The Empress', keyword: 'Abundance, nurturing, creativity.', image: 'https://picsum.photos/seed/empress/400/600' },
  { id: '4', name: 'The Emperor', keyword: 'Structure, stability, authority.', image: 'https://picsum.photos/seed/emperor/400/600' },
  { id: '5', name: 'The Hierophant', keyword: 'Tradition, formal learning, consensus.', image: 'https://picsum.photos/seed/hierophant/400/600' },
  { id: '6', name: 'The Lovers', keyword: 'Harmony, alignment, choice.', image: 'https://picsum.photos/seed/lovers/400/600' },
  { id: '7', name: 'The Chariot', keyword: 'Willpower, focus, discipline.', image: 'https://picsum.photos/seed/chariot/400/600' },
  { id: '8', name: 'Strength', keyword: 'Courage, patience, soft power.', image: 'https://picsum.photos/seed/strength/400/600' },
  { id: '9', name: 'The Hermit', keyword: 'Soul-searching, introspection, solitude.', image: 'https://picsum.photos/seed/hermit/400/600' },
  { id: '10', name: 'Wheel of Fortune', keyword: 'Cycles, turning points, patterns.', image: 'https://picsum.photos/seed/wheel/400/600' },
  { id: '11', name: 'Justice', keyword: 'Fairness, cause and effect, truth.', image: 'https://picsum.photos/seed/justice/400/600' },
  { id: '12', name: 'The Hanged Man', keyword: 'New perspective, surrender, pause.', image: 'https://picsum.photos/seed/hanged/400/600' },
  { id: '13', name: 'Death', keyword: 'Transition, ending of a cycle, release.', image: 'https://picsum.photos/seed/death/400/600' },
  { id: '14', name: 'Temperance', keyword: 'Balance, moderation, flow.', image: 'https://picsum.photos/seed/temp/400/600' },
  { id: '15', name: 'The Devil', keyword: 'Attachments, habits, constraints.', image: 'https://picsum.photos/seed/devil/400/600' },
  { id: '16', name: 'The Tower', keyword: 'Sudden change, breaking ground, clarity.', image: 'https://picsum.photos/seed/tower/400/600' },
  { id: '17', name: 'The Star', keyword: 'Hope, inspiration, renewal.', image: 'https://picsum.photos/seed/star/400/600' },
  { id: '18', name: 'The Moon', keyword: 'Uncertainty, imagination, the subconscious.', image: 'https://picsum.photos/seed/moon/400/600' },
  { id: '19', name: 'The Sun', keyword: 'Vitality, success, clarity.', image: 'https://picsum.photos/seed/sun/400/600' },
  { id: '20', name: 'Judgement', keyword: 'Reflection, reckoning, absolution.', image: 'https://picsum.photos/seed/judgement/400/600' },
  { id: '21', name: 'The World', keyword: 'Completion, integration, travel.', image: 'https://picsum.photos/seed/world/400/600' }
];
